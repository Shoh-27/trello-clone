import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import api from '../lib/axios'
import { useSocket } from '../contexts/SocketContext'
import List from '../components/List'

export default function BoardView() {
    const { boardId } = useParams()
    const [showAddList, setShowAddList] = useState(false)
    const [newListTitle, setNewListTitle] = useState('')
    const queryClient = useQueryClient()
    const { socket, connected, joinBoard, leaveBoard } = useSocket()

    // Fetch board data
    const { data: board, isLoading } = useQuery({
        queryKey: ['board', boardId],
        queryFn: async () => {
            const response = await api.get(`/boards/${boardId}`)
            return response.data
        },
    })

    // Socket.io real-time updates
    useEffect(() => {
        if (connected && boardId) {
            joinBoard(boardId)

            // Listen for card updates
            socket.on('cardUpdated', (payload) => {
                console.log('Card updated:', payload)
                queryClient.invalidateQueries(['board', boardId])
            })

            // Listen for list updates
            socket.on('listUpdated', (payload) => {
                console.log('List updated:', payload)
                queryClient.invalidateQueries(['board', boardId])
            })

            // Listen for comments
            socket.on('commentAdded', (payload) => {
                console.log('Comment added:', payload)
                queryClient.invalidateQueries(['board', boardId])
            })

            return () => {
                leaveBoard(boardId)
                socket.off('cardUpdated')
                socket.off('listUpdated')
                socket.off('commentAdded')
            }
        }
    }, [connected, boardId, socket, joinBoard, leaveBoard, queryClient])

    // Create list mutation
    const createListMutation = useMutation({
        mutationFn: async (title) => {
            const response = await api.post(`/boards/${boardId}/lists`, { title })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId])
            setNewListTitle('')
            setShowAddList(false)
        },
    })

    // Handle drag and drop
    const handleDragEnd = async (result) => {
        const { source, destination, type } = result

        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        if (type === 'list') {
            // Reorder lists
            const lists = Array.from(board.lists)
            const [removed] = lists.splice(source.index, 1)
            lists.splice(destination.index, 0, removed)

            // Optimistic update
            queryClient.setQueryData(['board', boardId], {
                ...board,
                lists: lists.map((list, index) => ({ ...list, position: index })),
            })

            // Update on server
            try {
                await api.post(`/boards/${boardId}/lists/reorder`, {
                    lists: lists.map((list, index) => ({ id: list.id, position: index })),
                })
            } catch (error) {
                queryClient.invalidateQueries(['board', boardId])
            }
        } else if (type === 'card') {
            const sourceList = board.lists.find(l => l.id.toString() === source.droppableId)
            const destList = board.lists.find(l => l.id.toString() === destination.droppableId)

            if (source.droppableId === destination.droppableId) {
                // Reorder cards within same list
                const cards = Array.from(sourceList.cards)
                const [removed] = cards.splice(source.index, 1)
                cards.splice(destination.index, 0, removed)

                // Optimistic update
                const updatedLists = board.lists.map(list =>
                    list.id === sourceList.id
                        ? { ...list, cards: cards.map((card, index) => ({ ...card, position: index })) }
                        : list
                )
                queryClient.setQueryData(['board', boardId], { ...board, lists: updatedLists })

                // Update on server
                try {
                    await api.post(`/lists/${sourceList.id}/cards/reorder`, {
                        cards: cards.map((card, index) => ({ id: card.id, position: index })),
                    })
                } catch (error) {
                    queryClient.invalidateQueries(['board', boardId])
                }
            } else {
                // Move card to different list
                const sourceCards = Array.from(sourceList.cards)
                const destCards = Array.from(destList.cards)
                const [removed] = sourceCards.splice(source.index, 1)
                destCards.splice(destination.index, 0, removed)
                // Optimistic update
                const updatedLists = board.lists.map(list => {
                    if (list.id === sourceList.id) {
                        return { ...list, cards: sourceCards.map((card, index) => ({ ...card, position: index })) }
                    } else if (list.id === destList.id) {
                        return { ...list, cards: destCards.map((card, index) => ({ ...card, position: index, list_id: destList.id })) }
                    }
                    return list
                })
                queryClient.setQueryData(['board', boardId], { ...board, lists: updatedLists })

                // Update on server
                try {
                    await api.post(`/cards/${removed.id}/move`, {
                        list_id: destList.id,
                        position: destination.index,
                    })
                } catch (error) {
                    queryClient.invalidateQueries(['board', boardId])
                }
            }
        }
    }
    const handleCreateList = (e) => {
        e.preventDefault()
        if (newListTitle.trim()) {
            createListMutation.mutate(newListTitle)
        }
    }
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading board...</div>
            </div>
        )
    }
    return (
        <div
            className="min-h-screen p-6"
            style={{ backgroundColor: board.background_color }}
        >
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">{board.title}</h1>
                {board.description && (
                    <p className="text-white opacity-90">{board.description}</p>
                )}
                {connected && (
                    <div className="mt-2 text-green-300 text-sm">● Real-time updates active</div>
                )}
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="board" type="list" direction="horizontal">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex space-x-4 overflow-x-auto pb-4"
                        >
                            {board.lists?.map((list, index) => (
                                <List key={list.id} list={list} index={index} boardId={boardId} />
                            ))}
                            {provided.placeholder}

                            {/* Add List Button */}
                            <div className="flex-shrink-0 w-72">
                                {showAddList ? (
                                    <form onSubmit={handleCreateList} className="bg-gray-100 rounded-lg p-3">
                                        <input
                                            type="text"
                                            value={newListTitle}
                                            onChange={(e) => setNewListTitle(e.target.value)}
                                            placeholder="Enter list title..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                                            autoFocus
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                disabled={createListMutation.isPending}
                                                className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                                            >
                                                Add List
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddList(false)
                                                    setNewListTitle('')
                                                }}
                                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setShowAddList(true)}
                                        className="w-full bg-white bg-opacity-30 hover:bg-opacity-40 text-white font-semibold py-3 px-4 rounded-lg flex items-center space-x-2 transition"
                                    >
                                        <Plus size={20} />
                                        <span>Add another list</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    )
}