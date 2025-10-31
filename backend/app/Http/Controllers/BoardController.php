<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BoardController extends Controller
{
    /**
     * Display a listing of user's boards
     */
    public function index(Request $request)
    {
        $boards = $request->user()->boards()->with('lists.cards')->get();

        return response()->json($boards);
    }

    /**
     * Store a newly created board
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'background_color' => 'nullable|string|max:7',
        ]);

        $board = $request->user()->boards()->create($request->all());

        // Log activity
        ActivityLog::create([
            'action' => 'created',
            'description' => "{$request->user()->name} created board \"{$board->title}\"",
            'loggable_type' => Board::class,
            'loggable_id' => $board->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($board, 201);
    }
}
