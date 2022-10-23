import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Web3Modal from 'web3modal';
import Market from '../build/contracts/RentMarket.json'
import { ethers } from 'ethers';

export function useRental() {
    const [connection, setConnection] = useState("")
    const [publicKey, setPublicKey] = useState("")
    const [connected, setConnected] = useState(false)
    const [isCorrectNetworkFlag, setIsCorrectNetwork] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [user,setUser] = useState({})
    const [properties, setProperties] = useState([])
    const [bookings, setBookings] = useState([])
    const [lastAirbnb, setLastAirbnb] = useState(0)
    const [lastBookId,setLastBookId] = useState(0)
    const [loading, setLoading] = useState(false)
    const [transactionPending, setTransactionPending] = useState(false)
    const [web3Modal,setWeb3Modal] = useState(null);

    useEffect(()=> {

        const start = async () => {
            if (!transactionPending) {
                try {
                    console.log('Hi');
                    const web3ModalLocal = new Web3Modal();
                    web3ModalLocal.clearCachedProvider();
                    let connection = await web3ModalLocal.connect();
                    let isCorrectNetwork = isPolygonTestnet();
                    setIsCorrectNetwork(isCorrectNetwork);
                    if (isCorrectNetwork){
                        const provider = new ethers.providers.Web3Provider(connection);
                        let signer = provider.getSigner();
                        let pbKey = await signer.getAddress();
                        let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
                        let allProperties = await contract.fetchPropertiesOnMarket();
                        console.log(allProperties);
                        setProperties(allProperties);
                        setUser(pbKey);
                        setPublicKey(pbKey);
                        setWeb3Modal(web3ModalLocal);
                        setInitialized(true);
                        setConnected(true);
                    }else{
                        setInitialized(false);
                        setLoading(false);
                    }
                } catch (error) {
                    console.log(error);
                    setInitialized(false);
                } finally {
                    setLoading(false);
                }
            }
        }
        start()

    },[initialized])

    const isPolygonTestnet = async () => {
        const chainId = 80001 // Polygon Testnet

        if (window.ethereum.networkVersion !== chainId) {
            return false;
        }

        return true;
    }

    const addProperty = async ({name, location, country, price, imageURL}) => {
        if (web3Modal && isCorrectNetworkFlag){
            let connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
            setTransactionPending(true)
            setLoading(true)
            try {
                price = ethers.utils.parseUnits(price, 'ether');
        
                let listingPrice = await contract.getListingPrice();
                listingPrice = listingPrice.toString();
                // let listingPrice = ethers.utils.parseUnits('0.02', 'ether');
                let transaction = await contract.createProperty(
                    name, location, country, imageURL, price, {value: listingPrice}
                )
                await transaction.wait();
                toast.success('Successfully Added A Property');
                getAllProperties();
            }catch(err){
                toast.error('Error: Please Try Again');
                console.log(err);
            }finally{
                setTransactionPending(false)
                setLoading(false)
            }
        } else {
            toast.error('Error: Please Connect to the Polygon Testnet Network');
        }
    }

    const updateProperty = async ({propertyID, name, location, country, price, imageURL}) => {
        if (web3Modal && isCorrectNetworkFlag){
            let connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
            setTransactionPending(true)
            setLoading(true);
            try {
                price = ethers.utils.parseUnits(price, 'ether');
                let transaction = await contract.updateProperty(propertyID, name, location, country, imageURL, price)
                await transaction.wait();
                toast.success('Successfully Updated Property');
                getAllProperties();
            }catch(err){
                toast.error('Error: Please Try Again');
                console.log(err);
            }finally{
                setTransactionPending(false)
                setLoading(false)
            }
        }else{
            toast.error('Error: Please Connect to the Polygon Testnet Network');
        }
    }

    const removeProperty = async ({propertyID}) => {
        if (web3Modal && isCorrectNetworkFlag){
            let connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
            setTransactionPending(true)
            setLoading(true)
            try {
                console.log(propertyID);
                let transaction = await contract.removeProperty(propertyID);
                await transaction.wait();
                toast.success('Successfully Removed This Property. Please Refresh');
                getAllProperties();
            }catch(err){
                toast.error('Error: Please Try Again');
                console.log(err);
            }finally{
                setTransactionPending(false)
                setLoading(false)
            }
        }else{
            toast.error('Error: Please Connect to the Polygon Testnet Network');
        }
    }

    const bookProperty = async ({propertyID, startDate, endDate, price}) => {
        if (web3Modal && isCorrectNetworkFlag){
            let connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
            setTransactionPending(true)
            setLoading(true)
            try {
                price = ethers.utils.parseUnits(price, 'ether');
                let transaction = await contract.bookProperty(propertyID, startDate, endDate, {value: price})
                await transaction.wait();
                toast.success('Successfully Booked Property');
                getAllProperties();
            }catch(err){
                toast.error('Error: Please Try Again');
                console.log(err);
            }finally{
                setTransactionPending(false)
                setLoading(false)
            }
        }else{
            toast.error('Error: Please Connect to the Polygon Testnet Network');
        }
    }

    const getPropertiesFromHost = async () => {
        if (web3Modal && isCorrectNetworkFlag){
            let connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
            setTransactionPending(true)
            setLoading(true)
            try {

                let allProperties = await contract.fetchPropertiesFromHost();
                setProperties([...allProperties]);
            }catch(err){
                toast.error('Error: Please Try Again');
                console.log(err);
            }finally{
                setTransactionPending(false)
                setLoading(false)
            }
        }else{
            toast.error('Error: Please Connect to the Polygon Testnet Network');
        }
    }

    const getAllProperties = async () => {
        if (web3Modal && isCorrectNetworkFlag){
            let connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
            setTransactionPending(true)
            setLoading(true)
            try {
                let allProperties = await contract.fetchPropertiesOnMarket();
                    console.log(allProperties);
                    setProperties([...allProperties]);
            }catch(err){
                toast.error('Error: Please Try Again');
                console.log(err);
            }finally{
                setTransactionPending(false)
                setLoading(false)
            }
        }else{
            toast.error('Error: Please Connect to the Polygon Testnet Network');
        }
    }

    const getBookings = async () => {
        if (web3Modal && isCorrectNetworkFlag){
            let connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(process.env.NEXT_PUBLIC_MARKETADDRESS, Market.abi, signer);
            setTransactionPending(true)
            setLoading(true)
            try {
                let allProperties = await contract.fetchBookingsFromUser();
                    console.log(allProperties);
                    setProperties([...allProperties]);
            }catch(err){
                toast.error('Error: Please Try Again');
                console.log(err);
            }finally{
                setTransactionPending(false)
                setLoading(false)
            }
        }else{
            toast.error('Error: Please Connect to the Polygon Testnet Network');
        }
    }

    return {web3Modal, publicKey, properties, addProperty, updateProperty, removeProperty, bookProperty, getPropertiesFromHost, getAllProperties, getBookings, loading, transactionPending, initialized, connected}
}

