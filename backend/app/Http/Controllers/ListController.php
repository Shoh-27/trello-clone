<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\ActivityLog;
use App\Events\ListUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ListController extends Controller
{
    /**
     * Store a newly created list
     */
    public function store(Request $request, Board $board)
    {
        Gate::authorize('view', $board);

        $request->validate([
            'title' => 'required|string|max:255',
            'position' => 'nullable|integer',
        ]);

        // Get next position if not provided
        $position = $request->position ?? $board->lists()->max('position') + 1;

        $list = $board->lists()->create([
            'title' => $request->title,
            'position' => $position,
        ]);

        // Log activity
        ActivityLog::create([
            'action' => 'created',
            'description' => "{$request->user()->name} created list \"{$list->title}\"",
            'loggable_type' => BoardList::class,
            'loggable_id' => $list->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new ListUpdated($list, $board->id, 'created'));

        return response()->json($list->load('cards'), 201);
    }
    /**
     * Update the specified list
     */
    public function update(Request $request, BoardList $list)
    {
        Gate::authorize('view', $list->board);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|integer',
        ]);

        $list->update($request->all());

        // Log activity
        ActivityLog::create([
            'action' => 'updated',
            'description' => "{$request->user()->name} updated list \"{$list->title}\"",
            'loggable_type' => BoardList::class,
            'loggable_id' => $list->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new ListUpdated($list, $list->board_id, 'updated'));

        return response()->json($list->load('cards'));
    }
    /**
     * Remove the specified list
     */
    public function destroy(Request $request, BoardList $list)
    {
        Gate::authorize('view', $list->board);

        $listTitle = $list->title;
        $boardId = $list->board_id;
        $list->delete();

        // Log activity
        ActivityLog::create([
            'action' => 'deleted',
            'description' => "{$request->user()->name} deleted list \"{$listTitle}\"",
            'loggable_type' => BoardList::class,
            'loggable_id' => $list->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new ListUpdated($list, $boardId, 'deleted'));

        return response()->json(['message' => 'List deleted successfully']);
    }

}
