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
}
