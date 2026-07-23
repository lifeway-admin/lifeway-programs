import { User } from 'lucide-react'

export default function TeamMemberCard({ name, title, photo }) {
  return (
    <div className="card h-full p-8 flex flex-col items-center text-center">
      {photo ? (
        <img src={photo} alt={name} className="w-28 h-28 rounded-full border-4 border-lw-pink object-cover mb-5" />
      ) : (
        <div className="w-28 h-28 rounded-full border-4 border-lw-pink bg-lw-pink/50 flex items-center justify-center mb-5">
          <User size={48} className="text-lw-pink-light" />
        </div>
      )}
      <h3 className="font-bold text-lw-pink">{name}</h3>
      {title && <p className="text-gray-500 text-sm italic mt-1">{title}</p>}
    </div>
  )
}
