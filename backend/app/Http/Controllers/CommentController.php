<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Comment;
use App\Models\ActivityLog;
use App\Events\CommentAdded;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    /**
     * Display comments for a card
     */
    public function index(Card $card)
    {
        Gate::authorize('view', $card->list->board);

        return response()->json($card->comments()->with('user')->get());
    }

    /**
     * Store a newly created comment
     */
    public function store(Request $request, Card $card)
    {
        Gate::authorize('view', $card->list->board);

        $request->validate([
            'content' => 'required|string',
        ]);

        $comment = $card->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id,
        ]);

        // Log activity
        ActivityLog::create([
            'action' => 'commented',
            'description' => "{$request->user()->name} commented on \"{$card->title}\"",
            'loggable_type' => Card::class,
            'loggable_id' => $card->id,
            'user_id' => $request->user()->id,
        ]);

        // Broadcast event
        event(new CommentAdded($comment, $card->list->board_id));

        return response()->json($comment->load('user'), 201);
    }

}
