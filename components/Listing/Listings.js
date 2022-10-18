import ListingItem from './ListingItem'
import { ethers } from 'ethers';

function Listings({ connected, showReservedListing, listings, toggleEditListingModal, toggleReserveListingModal, removeListing, unreserveListing, publicKey, setCurrentEditListingID }) {
    return (
        <div className="px-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {listings.map((listing) => (
                    <ListingItem key={listing.propertyID} connected={connected} showReservedListing={showReservedListing} 
                    removeListing={removeListing} toggleEditListingModal={toggleEditListingModal} toggleReserveListingModal={toggleReserveListingModal}
                     unreserveListing={unreserveListing} 
                     location={listing.location} name={listing.name} country={listing.country} image={listing.image} price={ethers.utils.formatEther(listing.price, 'ether')}
                     propertyID={listing.propertyID}
                     publicKey={publicKey} owner={listing.owner}
                     setCurrentEditListingID={setCurrentEditListingID}
                     />
                ))}
            </div>
        </div>
    )
}

export default Listings