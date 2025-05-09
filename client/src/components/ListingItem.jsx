import { MdLocationOn } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function ListingItem({ listing }) {
  return (
    <div className='bg-transparent rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full h-full overflow-hidden group'>

      <Link to={`/listing/${listing._id}`}>
        <div className='relative'>
          <img
            src={listing.imageUrls[0]}
            alt={listing.name}
            className='h-[220px] w-full object-cover group-hover:scale-105 transition-transform duration-300'
          />
          {listing.offer && (
            <span className='absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
              OFFER
            </span>
          )}
        </div>
        <div className='p-4 flex flex-col gap-3'>
          <p className='text-xl font-semibold text-slate-800 truncate'>{listing.name}</p>

          <div className='flex items-center gap-1 text-green-600 text-sm'>
            <MdLocationOn className='w-5 h-5' />
            <p className='truncate text-gray-600'>{listing.address}</p>
          </div>

          <p className='text-sm text-gray-500 line-clamp-2'>{listing.description}</p>

          <div className='text-lg font-bold text-slate-700 mt-2'>
            ${listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}
            {listing.type === 'rent' && <span className='text-sm font-medium text-gray-500'> / month</span>}
          </div>

          <div className='flex items-center gap-4 text-sm text-slate-600 font-medium'>
            <span>{listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : '1 Bed'}</span>
            <span>{listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : '1 Bath'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
