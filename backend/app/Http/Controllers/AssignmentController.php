<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\User;
use App\Models\Assignment;
use App\Models\ActivityLog;
use App\Events\CardUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AssignmentController extends Controller
{
    /**
     * Assign user to card
     */
    public function store(Request $request, Card $card)
    {
        Gate::authorize('view', $card->list->board);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Check if already assigned
        $existing = Assignment::where('card_id', $card->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'User already assigned'], 409);
        }

        $assignment = Assignment::create([
            'card_id' => $card->id,
            'user_id' => $request->user_id,
        ]);

        $assignedUser = User::find($request->user_id);

        // Log activity
        ActivityLog::create([
            'action' => 'assigned',
            'description' => "{$request->user()->name} assigned {$assignedUser->name} to \"{$card->title}\"",
            'loggable_type' => Card::class,
            'loggable_id' => $card->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new CardUpdated($card, $card->list->board_id, 'assigned'));

        return response()->json($assignment->load('user'), 201);
    }
    /**
     * Remove assignment from card
     */
    public function destroy(Request $request, Card $card, User $user)
    {
        Gate::authorize('view', $card->list->board);

        $assignment = Assignment::where('card_id', $card->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$assignment) {
            return response()->json(['message' => 'Assignment not found'], 404);
        }

        $assignment->delete();

        // Log activity
        ActivityLog::create([
            'action' => 'unassigned',
            'description' => "{$request->user()->name} unassigned {$user->name} from \"{$card->title}\"",
            'loggable_type' => Card::class,
            'loggable_id' => $card->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new CardUpdated($card, $card->list->board_id, 'unassigned'));

        return response()->json(['message' => 'Assignment removed successfully']);
    }
}
