import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { Calendar, MessageSquare, User, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import CardModal from './CardModal'

export default function Card({ card, index, boardId }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Draggable draggableId={card.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowModal(true)}
            className={`bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-md transition ${
              snapshot.isDragging ? 'rotate-3 shadow-xl' : ''
            }`}
          >
            <h4 className="font-medium text-gray-800 mb-2">{card.title}</h4>
            
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              {card.due_date && (
                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                  <Calendar size={12} />
                  <span>{format(new Date(card.due_date), 'MMM d')}</span>
                </div>
              )}
              
              {card.comments?.length > 0 && (
                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                  <MessageSquare size={12} />
                  <span>{card.comments.length}</span>
                </div>
              )}
              
              {card.assignments?.length > 0 && (
                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                  <User size={12} />
                  <span>{card.assignments.length}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {showModal && (
        <CardModal
          card={card}
          boardId={boardId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
