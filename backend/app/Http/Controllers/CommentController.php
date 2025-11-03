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
}
