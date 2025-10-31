import { useState } from 'react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { Plus, Trash2, MoreVertical } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import Card from './Card'

export default function List({ list, index, boardId }) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const queryClient = useQueryClient()

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (title) => {
      const response = await api.post(`/lists/${list.id}/cards`, { title })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['board', boardId])
      setNewCardTitle('')
      setShowAddCard(false)
    },
  })

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/lists/${list.id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['board', boardId])
    },
  })

  const handleCreateCard = (e) => {
    e.preventDefault()
    if (newCardTitle.trim()) {
      createCardMutation.mutate(newCardTitle)
    }
  }

  const handleDeleteList = () => {
    if (confirm(`Are you sure you want to delete list "${list.title}"?`)) {
      deleteListMutation.mutate()
    }
  }

  return (
    <Draggable draggableId={list.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-100 rounded-lg w-72 flex-shrink-0 flex flex-col max-h-full"
        >
          {/* List Header */}
          <div
            {...provided.dragHandleProps}
            className="p-3 flex items-center justify-between border-b border-gray-200"
          >
            <h3 className="font-semibold text-gray-800">{list.title}</h3>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-200"
              >
                <MoreVertical size={18} />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg py-2 w-48 z-20">
                    <button
                      onClick={handleDeleteList}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Delete List</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cards */}
          <Droppable droppableId={list.id.toString()} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto p-2 space-y-2 ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                {list.cards?.map((card, index) => (
                  <Card key={card.id} card={card} index={index} boardId={boardId} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card */}
          <div className="p-2">
            {showAddCard ? (
              <form onSubmit={handleCreateCard} className="space-y-2">
                <textarea
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={createCardMutation.isPending}
                    className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCard(false)
                      setNewCardTitle('')
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddCard(true)}
                className="w-full text-left text-gray-600 hover:text-gray-800 py-2 px-3 rounded hover:bg-gray-200 flex items-center space-x-2 transition"
              >
                <Plus size={18} />
                <span>Add a card</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}