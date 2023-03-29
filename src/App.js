import './App.css';
import React, { useState, useRef, useCallback } from 'react';
import 'tailwindcss/tailwind.css';
import DeroBridgeApi from 'dero-rpc-bridge-api';
import to from 'await-to-js';
import { Transition } from '@headlessui/react';
import piggy from './assets/piggy.mp4';

function App() {
  const [bridgeInitText, setBridgeInitText] = useState('');
  const deroBridgeApiRef = useRef();
  const [spin, setSpin] = useState(false);
  const [winnerAddress, setWinnerAddress] = useState(null);
  const [currentUserAddress, setCurrentUserAddress] = useState(null);


  React.useEffect(() => {
    const load = async () => {
      deroBridgeApiRef.current = new DeroBridgeApi();
      const deroBridgeApi = deroBridgeApiRef.current;
      const [err] = await to(deroBridgeApi.init());
      if (!err) {
        setBridgeInitText('connected to extension');
        await getWalletAddress();

      }
    };

    window.addEventListener('load', load);
    return () => window.removeEventListener('load', load);
  }, []);

  const getWalletAddress = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current;
    const [err, res] = await to(deroBridgeApi.wallet('get-address'));
    if (err) {
    } else {
      if (res && res.result && res.result.address) {
        setCurrentUserAddress(res.result.address);
      }
    }
  }, []);
  

  const GetLastWinner = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current;
    const [err, res] = await to(deroBridgeApi.daemon('get-sc', {
      scid: "b960bbf90983bc8ae32e6758a2780a2f838347e02230ca785d66140e4cf883f3",
      variables: true
    }));
  
    if (res && res.result) {
      setWinnerAddress(hex2a(res.data.result.stringkeys.last_winner));
    } else {
      setWinnerAddress(hex2a(res.data.result.stringkeys.last_winner));
    }
  
    console.log(res);
  });
  
  const hex2a = (hex) => {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  };
  
  // export default function hex2a(hex){
  //   var str = '';
  //   for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  //   return str;

  const handleSpin = async (e) => {
    e.preventDefault();
    setSpin(true);

    const deposit = async () => {
      const deroBridgeApi = deroBridgeApiRef.current;
      console.log('deroBridgeApi:', deroBridgeApi);

      const params = {
        scid: 'b960bbf90983bc8ae32e6758a2780a2f838347e02230ca785d66140e4cf883f3',
        ringsize: 2,
        sc_rpc: [{
          name: "entrypoint",
          datatype: "S",
          value: "Lottery"
        }],
        transfers: [{
          burn: parseInt(e.target.amount.value) * 100000,
          destination: "deto1qy5gpycungnm0nj0kqxk9f7km86q925masvdz8eth7dkg64gktuc5qgkcvrcy"
        }]
      };
      console.log('params:', params);

      const [err, res] = await to(deroBridgeApi.wallet('start-transfer', params));
      console.log('err:', err);
      console.log('res:', res);
      console.log('Full response object:', JSON.stringify(res, null, 2));
      setWinnerAddress();

      if (!err && res) {
        await GetLastWinner();
      }
    };

    await deposit();

    setTimeout(() => {
      setSpin(false);
    }, 3000);
  };



  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex justify-center pt-10">
        <h1 className="text-4xl font-bold text-white">Dero Lottery Game</h1>
      </div>
      <div className="justify-center items-center flex flex-grow">
        <video autoPlay muted loop className="bg-video">
          <source src={piggy} type="video/mp4" />
        </video>
      </div>
      <div className="container mx-auto pb-10">
        <div className="flex justify-center">
          <div className="relative sm:w-3/4 md:w-w-2/3 lg:w-1/2">
            <div className="absolute inset-0 bg-yellow-600 w-1/2 rounded-lg blur-xl"></div>
            <div className=" relative">
              <div className="linear-gradient(to right, rgb(254, 249, 195), rgb(253, 224, 71), rgb(234, 179, 8)) p-5 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Deposit</h3>
                <form onSubmit={handleSpin} className="space-y-4 ">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (1 Dero = 1 entry)</label>
                    <input id="amount" type="number" min="1" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                  </div>
                  <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium
                   text-black bg-yellow-300 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                   whitespace-nowrap overflow-x-auto">
                    Deposit
                  </button>
                </form>
                <div className="mt-5 text-center">
                  <button className="w-full flex justify-center py-2 p-6 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-300 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    onClick={GetLastWinner}>Reveal The Winner {JSON.stringify(winnerAddress, null, 2)}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Transition
        show={bridgeInitText === 'connected to extension'}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed bottom-0 right-0 p-4">
          <div className="bg-green-500 text-white text-sm py-2 px-4 rounded-lg shadow-lg">
            Connected to extension
          </div>
        </div>
      </Transition>
    </div>
  ); }
  
  export default App;  