<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Card $card;
    public int $boardId;
    public string $action;

    /**
     * Create a new event instance.
     */
    public function __construct(Card $card, int $boardId, string $action = 'updated')
    {
        $this->card = $card;
        $this->boardId = $boardId;
        $this->action = $action;
    }
}
