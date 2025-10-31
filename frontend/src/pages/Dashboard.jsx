import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import api from '../lib/axios'

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const queryClient = useQueryClient()

  // Fetch boards
  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await api.get('/boards')
      return response.data
    },
  })

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (boardData) => {
      const response = await api.post('/boards', boardData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['boards'])
      setShowCreateModal(false)
      setNewBoardTitle('')
      setNewBoardDescription('')
    },
  })

  // Delete board mutation
  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId) => {
      await api.delete(`/boards/${boardId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['boards'])
    },
  })

  const handleCreateBoard = (e) => {
    e.preventDefault()
    createBoardMutation.mutate({
      title: newBoardTitle,
      description: newBoardDescription,
      background_color: '#0079bf',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading boards...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Boards</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>Create Board</span>
        </button>
      </div>

      {boards && boards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No boards yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards?.map((board) => (
            <div
              key={board.id}
              className="relative group bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <Link to={`/boards/${board.id}`}>
                <div
                  className="h-32 p-4 flex items-end"
                  style={{ backgroundColor: board.background_color }}
                >
                  <h3 className="text-white font-bold text-lg">{board.title}</h3>
                </div>
              </Link>
              <div className="p-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {board.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this board?')) {
                    deleteBoardMutation.mutate(board.id)
                  }
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Board</h2>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board Title
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={createBoardMutation.isPending}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createBoardMutation.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}