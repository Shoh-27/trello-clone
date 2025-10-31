import { useState, useEffect } from 'react'
import { X, Calendar, MessageSquare, User, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'

export default function CardModal({ card, boardId, onClose }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dueDate, setDueDate] = useState(card.due_date || '')
  const [newComment, setNewComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Fetch card details
  const { data: cardDetails } = useQuery({
    queryKey: ['card', card.id],
    queryFn: async () => {
      const response = await api.get(`/cards/${card.id}`)
      return response.data
    },
  })

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/cards/${card.id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['board', boardId])
      queryClient.invalidateQueries(['card', card.id])
      setIsEditing(false)
    },
  })

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/cards/${card.id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['board', boardId])
      onClose()
    },
  })

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      const response = await api.post(`/cards/${card.id}/comments`, { content })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['card', card.id])
      setNewComment('')
    },
  })

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      await api.delete(`/comments/${commentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['card', card.id])
    },
  })

  const handleSave = () => {
    updateCardMutation.mutate({
      title,
      description,
      due_date: dueDate || null,
    })
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment)
    }
  }

  const handleDeleteCard = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCardMutation.mutate()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-semibold border border-gray-300 rounded px-2 py-1"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">Description</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 min-h-[100px]"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-600">
                {description || 'No description'}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-700">Due Date</h3>
            </div>
            {isEditing ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            ) : (
              <p className="text-gray-600">
                {dueDate ? format(new Date(dueDate), 'MMMM d, yyyy') : 'No due date'}
              </p>
            )}
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={updateCardMutation.isPending}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTitle(card.title)
                  setDescription(card.description || '')
                  setDueDate(card.due_date || '')
                  setIsEditing(false)
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Assignments */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <User size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-700">Assigned Members</h3>
            </div>
            {cardDetails?.assignments?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cardDetails.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {assignment.user.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No members assigned</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-700">Comments</h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border border-gray-300 rounded p-3 mb-2 min-h-[80px]"
              />
              <button
                type="submit"
                disabled={addCommentMutation.isPending || !newComment.trim()}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Add Comment
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {cardDetails?.comments?.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-sm">{comment.user.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {comment.user_id === user.id && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this comment?')) {
                            deleteCommentMutation.mutate(comment.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              ))}
              {cardDetails?.comments?.length === 0 && (
                <p className="text-gray-500 text-sm">No comments yet</p>
              )}
            </div>
          </div>

          {/* Activity Log */}
          {cardDetails?.activity_logs && cardDetails.activity_logs.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Activity</h3>
              <div className="space-y-2">
                {cardDetails.activity_logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-sm text-gray-600">
                    <span className="font-medium">{log.user.name}</span> {log.description}
                    <span className="text-xs text-gray-400 ml-2">
                      {format(new Date(log.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete Card */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDeleteCard}
              className="text-red-600 hover:text-red-800 flex items-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Delete Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}