'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useWalletStore } from '@/app/lib/store'

function CustomWalletButton() {
  const { connecting, connected, publicKey } = useWallet()
  const [isClient, setIsClient] = useState(false)
  const { setWalletState } = useWalletStore()
  
  // 确保组件在客户端渲染
  useEffect(() => {
    setIsClient(true)
    if (isClient && connected !== undefined) {
      setWalletState(connected, publicKey?.toBase58() || null)
    }
  }, [connected, publicKey, setWalletState, isClient])

  if (!isClient) {
    return (
      <button 
        className="py-2 px-4 rounded-md font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        连接钱包
      </button>
    )
  }

  // 自定义按钮样式类
  const buttonClass = "py-2 px-4 rounded-md font-medium transition-colors " + 
    (connected 
      ? "bg-green-600 hover:bg-green-700 text-white"
      : connecting
        ? "bg-yellow-500 hover:bg-yellow-600 text-white cursor-wait"
        : "bg-indigo-600 hover:bg-indigo-700 text-white"
    )

  // 自定义按钮文本
  const buttonText = connected 
    ? `已连接 (${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)})` 
    : connecting
      ? "连接中..."
      : "连接钱包"

  return (
    <WalletMultiButton 
      className={buttonClass}
    >
      {buttonText}
    </WalletMultiButton>
  )
}

export const WalletButton = dynamic(
  () => Promise.resolve(CustomWalletButton),
  { 
    ssr: false,
    loading: () => (
      <button 
        className="py-2 px-4 rounded-md font-medium bg-gray-400 text-white cursor-not-allowed"
        disabled
      >
        加载中...
      </button>
    )
  }
)