<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\BoardList;
use App\Models\ActivityLog;
use App\Events\CardUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CardController extends Controller
{
    /**
     * Store a newly created card
     */
    public function store(Request $request, BoardList $list)
    {
        Gate::authorize('view', $list->board);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'position' => 'nullable|integer',
        ]);

        // Get next position if not provided
        $position = $request->position ?? $list->cards()->max('position') + 1;

        $card = $list->cards()->create([
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'position' => $position,
        ]);

        // Log activity
        ActivityLog::create([
            'action' => 'created',
            'description' => "{$request->user()->name} created card \"{$card->title}\"",
            'loggable_type' => Card::class,
            'loggable_id' => $card->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new CardUpdated($card, $list->board_id, 'created'));

        return response()->json($card->load(['comments', 'assignments']), 201);
    }

    /**
     * Display the specified card
     */
    public function show(Card $card)
    {
        Gate::authorize('view', $card->list->board);

        return response()->json($card->load(['comments', 'assignments.user', 'activityLogs']));
    }

    /**
     * Update the specified card
     */
    public function update(Request $request, Card $card)
    {
        Gate::authorize('view', $card->list->board);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'position' => 'sometimes|required|integer',
            'list_id' => 'sometimes|required|exists:lists,id',
        ]);

        $oldListId = $card->list_id;
        $card->update($request->all());

        // Log activity
        $action = $request->has('list_id') && $oldListId != $request->list_id ? 'moved' : 'updated';
        ActivityLog::create([
            'action' => $action,
            'description' => "{$request->user()->name} {$action} card \"{$card->title}\"",
            'loggable_type' => Card::class,
            'loggable_id' => $card->id,
            'user_id' => $request->user()->id,
            'metadata' => $request->has('list_id') ? ['old_list_id' => $oldListId, 'new_list_id' => $request->list_id] : null,
        ]);

        // Broadcast event
        event(new CardUpdated($card, $card->list->board_id, $action));

        return response()->json($card->load(['comments', 'assignments']));
    }

    /**
     * Remove the specified card
     */
    public function destroy(Request $request, Card $card)
    {
        Gate::authorize('view', $card->list->board);

        $cardTitle = $card->title;
        $boardId = $card->list->board_id;
        $card->delete();

        // Log activity
        ActivityLog::create([
            'action' => 'deleted',
            'description' => "{$request->user()->name} deleted card \"{$cardTitle}\"",
            'loggable_type' => Card::class,
            'loggable_id' => $card->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new CardUpdated($card, $boardId, 'deleted'));

        return response()->json(['message' => 'Card deleted successfully']);
    }

}
