const gallery = [
  {
    id: 1,
    title: 'Chocolate Fudge',
    image:
      'https://images.unsplash.com/photo-1603079842035-338f557d29a9?auto=format&fit=crop&w=800&q=80',
    description: 'Rich chocolate sponge layered with fudge frosting.',
  },
  {
    id: 2,
    title: 'Berry Delight',
    image:
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh berries with vanilla cream and a buttery base.',
  },
  {
    id: 3,
    title: 'Citrus Zest',
    image:
      'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=800&q=80',
    description: 'Lemon sponge with a light meringue topping.',
  },
]

export default function PublicGallery() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-slate-500">Public Page</p>
        <h1 className="text-2xl font-semibold text-slate-900">Our Latest Creations</h1>
        <p className="text-sm text-slate-600">
          Everyone can view this gallery. Photos and content are managed by the admin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-48 w-full object-cover"
              loading="lazy"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
              <button className="text-sm font-semibold text-slate-900 hover:text-slate-700">
                View details
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

