import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file
import { format } from 'date-fns'
import { ethers } from 'ethers';

export default function ReserveListingModal({ reserveListing,currentEditListing, reserveListingModalOpen, setReserveListingModalOpen }) {
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [dates, setDates] = useState([])
    const [getClosedDates, setGetClosedDates] = useState(false)
    const selectionRange = {
        startDate,
        endDate,
        key: 'selection',
    }

    const handleSelect = (ranges) => {
        setStartDate(ranges.selection.startDate)
        setEndDate(ranges.selection.endDate)
    }

    const closeModal = () => {
        setReserveListingModalOpen(false)
    }

    function disableBookedDays() { 
        let dates = [];
        if (currentEditListing != null){
            for(let i = 0; i < currentEditListing.bookings.length; i++){
                let bookingInfo = currentEditListing.bookings[i];
                let endDateBooking = new Date(bookingInfo.endDate.toNumber());
                let tempDate = new Date(bookingInfo.startDate.toNumber());
                while (tempDate <= endDateBooking){
                    dates.push(new Date(tempDate.getTime()));
                    tempDate.setDate(tempDate.getDate() + 1);
                }
            }
    
            setDates([...dates]);
        }
        return dates;
      };

      useEffect(()=> {
        disableBookedDays();
    },[currentEditListing])

    const onConfirm = (e) => {
        e.preventDefault()

        let startDateObj = new Date(startDate);
        let endDateObj = new Date(endDate);
        const startDateVal = Math.floor(startDateObj.getTime());
        const endDateVal = Math.floor(endDateObj.getTime());
        let propertyID = currentEditListing.propertyID;
        let rentalPrice = ethers.utils.formatEther(currentEditListing.price, 'ether');
        reserveListing({propertyID, startDate: startDateVal, endDate: endDateVal, price: rentalPrice});

        closeModal()
    }

    return (
        <Transition appear show={reserveListingModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    Reserve Listing
                                </Dialog.Title>

                                <div className="mt-2">
                                    <DateRangePicker minDate={new Date()} rangeColors={['#FD5B61']} ranges={[selectionRange]} onChange={handleSelect} 
                                    disabledDates={dates} />

                                    <div className="mt-4 flex justify-end">
                                        <button onClick={onConfirm} type="button" className="border rounded-lg px-4 py-2 text-sm font-medium">
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}