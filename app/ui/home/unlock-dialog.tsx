import { Modal, Button } from '@nextui-org/react'
import { useWalletStore } from '@/app/lib/store'
import { useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'

export function UnlockDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { publicKey, sendTransaction } = useWallet()
  const { setUnlimitedAccess } = useWalletStore()
  const { connection } = useConnection() // Add this
  const handlePaySOL = async () => {
    if (!publicKey) return
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('2ZcQzgr9HbnvE7DgeBnBBWHmVwaooKKK352hG738Xsvv'), // Replace with your wallet
          lamports: 0.001 * LAMPORTS_PER_SOL
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature)
      
      setUnlimitedAccess(true)
      onClose()
    } catch (err) {
      console.error(err)
      alert('支付失败')
    }
  }

  const handleBuyNFT = () => {
    window.open('https://www.baidu.com', '_blank') // Replace with NFT marketplace URL
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>解锁无限对话</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <Button onClick={handlePaySOL} color="primary" className="w-full">
            支付 0.001 SOL 解锁
          </Button>
          <div className="text-center">或</div>
          <Button onClick={handleBuyNFT} color="secondary" className="w-full">
            购买 NFT 解锁
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}
