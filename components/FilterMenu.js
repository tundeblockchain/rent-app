import Image from 'next/image'
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import Mode from '../constants/constants'
function FilterMenu({setMode}) {
    const menus = [
        {
            title: 'All Properties',
            icon: 'https://a0.muscache.com/pictures/732edad8-3ae0-49a8-a451-29a8010dcc0c.jpg',
        },
        {
            title: 'My Properties',
            icon: 'https://a0.muscache.com/pictures/35919456-df89-4024-ad50-5fcb7a472df9.jpg',
        },
        {
            title: 'My Bookings',
            icon: 'https://a0.muscache.com/pictures/50861fca-582c-4bcc-89d3-857fb7ca6528.jpg',
        }
    ]

    return (
        <div className="px-20 pb-10 flex justify-between items-center">
            <div className="flex items-center space-x-10">
                {menus.map((menu, index) => (
                    <button key={index} onClick={() => setMode(menu.title)}>
                        <div className="flex flex-col justify-center items-center space-y-2">
                            <div className="relative h-6 w-6">
                                <Image objectFit="contain" layout="fill" src={menu.icon} />
                            </div>

                            <p className="text-xs font-light">{menu.title}</p>
                        </div>
                    </button>
                ))}
            </div>
            <button className="border rounded-lg p-4 text-xs font-medium flex space-x-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Filters</span>
            </button>
        </div>
    )
}

export default FilterMenu