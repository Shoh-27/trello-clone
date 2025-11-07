<?php

namespace App\Events;

use App\Models\BoardList;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public BoardList $list;
    public int $boardId;
    public string $action;

    /**
     * Create a new event instance.
     */
    public function __construct(BoardList $list, int $boardId, string $action = 'updated')
    {
        $this->list = $list;
        $this->boardId = $boardId;
        $this->action = $action;
    }
}
