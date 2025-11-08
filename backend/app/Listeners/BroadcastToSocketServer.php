<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BroadcastToSocketServer
{
    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        $socketUrl = config('services.socket.url', 'http://socket:3000') . '/events';

        try {
            $payload = $this->preparePayload($event);

            Http::timeout(5)->post($socketUrl, $payload);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast to socket server: ' . $e->getMessage());
        }
    }

    /**
     * Prepare payload based on event type
     */
    private function preparePayload($event): array
    {
        $eventType = class_basename($event);

        switch ($eventType) {
            case 'CardUpdated':
                return [
                    'event' => 'cardUpdated',
                    'boardId' => $event->boardId,
                    'action' => $event->action,
                    'data' => $event->card->load(['comments', 'assignments.user']),
                ];

            case 'ListUpdated':
                return [
                    'event' => 'listUpdated',
                    'boardId' => $event->boardId,
                    'action' => $event->action,
                    'data' => $event->list->load('cards'),
                ];

            case 'CommentAdded':
                return [
                    'event' => 'commentAdded',
                    'boardId' => $event->boardId,
                    'data' => $event->comment->load('user'),
                ];

            default:
                return [];
        }
    }
}
