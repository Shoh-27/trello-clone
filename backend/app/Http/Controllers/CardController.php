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
}
