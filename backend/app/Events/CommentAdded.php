<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentAdded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Comment $comment;
    public int $boardId;

    /**
     * Create a new event instance.
     */
    public function __construct(Comment $comment, int $boardId)
    {
        $this->comment = $comment;
        $this->boardId = $boardId;
    }
}
