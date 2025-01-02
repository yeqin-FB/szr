import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'
import { ModelDefault } from "@/app/lib/live2d/lappdefine";
import { Comm } from "@/app/lib/comm";

// ==================== 交互模式 ==================
export enum InteractionMode {
    CHATBOT = "聊天模式",
    DIGITALHUMAN = "数字人模式",
    IMMERSIVE = "沉浸模式",

}

interface InteractionModeState {
    mode: InteractionMode
    setChatbotMode: () => void
    setDigitalhuamnMode: () => void
    setImmersiveMode: () => void
}

export const useInteractionModeStore = create<InteractionModeState>()(
    (set) => ({
        mode: InteractionMode.DIGITALHUMAN,
        setChatbotMode: () => set((state) => ({ mode: InteractionMode.CHATBOT })),
        setDigitalhuamnMode: () => set((state) => ({ mode: InteractionMode.DIGITALHUMAN })),
        setImmersiveMode: () => set((state) => ({ mode: InteractionMode.IMMERSIVE })),
    })

)

// ==================== 人物选择 ==================
interface CharacterState {
    character: string
    setCharacter: (character: string) => void
}
export const useCharacterStore = create<CharacterState>()(
    persist(
        (set) => ({
            character: ModelDefault,
            setCharacter: (by: string) => set((state) => ({ character: by })),
        }),
        {
            name: 'character-storage',
        }
    )

)

// ==================== 背景选择 ==================
interface BackgroundState {
    background: string | null
    setBackground: (background: string | null) => void
}
export const useBackgroundStore = create<BackgroundState>()(
    persist(
        (set) => ({
            background: null,
            setBackground: (by: string | null) => set((state) => ({ background: by })),
        }),
        {
            name: 'background-storage',
        }
    )
)

// ==================== 聊天记录 ==================
export enum ChatRole {
    HUMAN = "HUMAN",
    AI = "AI",
}
export interface ChatMessage {
    role: ChatRole
    content: string
}
interface ChatRecordState {
    chatRecord: ChatMessage[]
    addChatRecord: (message: ChatMessage) => void
    updateLastRecord: (message: ChatMessage) => void
    clearChatRecord: () => void
}
export const useChatRecordStore = create<ChatRecordState>()(
    (set) => ({
        chatRecord: [],
        addChatRecord: (message: ChatMessage) => set((state) => ({ chatRecord: [...state.chatRecord, message] })),
        updateLastRecord: (message: ChatMessage) => set((state) => ({ chatRecord: [...state.chatRecord.slice(0, -1), message] })),
        clearChatRecord: () => set((state) => ({ chatRecord: [] })),
    })
)

// ==================== agent引擎 ==================
interface AgentEngineState {
    agentEngine: string
    fetchDefaultAgent: () => Promise<void>;
    setAgentEngine: (engine: string) => void
}
export const useAgentModeStore = create<AgentEngineState>()(
    persist(
        (set) => ({
            agentEngine: "RepeaterAgent",
            // 获取默认的agent引擎
            fetchDefaultAgent: async () => {
                Comm.getInstance().getDefaultAgent().then((res) => {
                    if (res) {
                        set({ agentEngine: res })
                    }
                })
            },
            setAgentEngine: (engine: string) => set((state) => ({ agentEngine: engine })),
        }),
        {
            name: 'agentEngine-storage',
        }
    )
)

// ==================== agent设置 ==================

interface AgentEngineSettings {
    agentSettings: { [key: string]: { [key: string]: string }[] }
    fetchAgentSettings: () => Promise<void>;
    setAgentSettings: (engine: string, settings: { [key: string]: string }[]) => void
}

export const useAgentEngineSettingsStore = create<AgentEngineSettings>()(
    persist(
        (set) => ({
            agentSettings: {},
            fetchAgentSettings: async () => {
                Comm.getInstance().getAgentsList().then((agents) => {
                    agents.forEach((agent) => {
                        Comm.getInstance().getAgentSettings(agent).then((res) => {
                            if (res) {
                                set((state) => {
                                    // 未做持久化存储和后端参数变更的值
                                    if (!(agent in state.agentSettings) || state.agentSettings[agent].length != res.length) {
                                        return { agentSettings: { ...state.agentSettings, [agent]: res } }
                                    }
                                    // 持久化存储值只对非空字段更新
                                    let newAgentSetting = state.agentSettings;
                                    for (let item of res) {
                                        if (item.DEFAULT != "") {
                                            // 需要更新的值
                                            for (let i = 0; i < newAgentSetting[agent].length; i++) {
                                                if (newAgentSetting[agent][i].NAME == item.NAME) {
                                                    newAgentSetting[agent][i].DEFAULT = item.DEFAULT;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    return { agentSettings: newAgentSetting }
                                })
                            }
                        })
                    })
                })
            },
            setAgentSettings: (agent: string, newSettings: { [key: string]: string }[]) => set(
                (state) => ({agentSettings: {...state.agentSettings, [agent]: newSettings}})
            )
        }),
        {
            name: 'agentEngineSettings-storage',
        }
    )
)

// ==================== 静音设置 ==================
interface MuteState {
    mute: boolean
    setMute: (mute: boolean) => void
}
export const useMuteStore = create<MuteState>()(
    persist(
        (set) => ({
            mute: false,
            setMute: (mute: boolean) => set((state) => ({ mute: mute })),
        }),
        {
            name: 'mute-storage', // name of the item in the storage (must be unique)
        }
    )

)

// ==================== 后续语音自动结束设置 ==================
interface AudioAutoStopState {
    audioAutoStop: boolean
    setAudioAutoStop: (audioAutoStop: boolean) => void
}
export const useAudioAutoStopStore = create<AudioAutoStopState>()(
    persist(
        (set) => ({
            audioAutoStop: true, // 默认开启
            setAudioAutoStop: (audioAutoStop: boolean) => set((state) => ({ audioAutoStop: audioAutoStop })),
        }),
        {
            name: 'audioAutoStop-storage', // name of the item in the storage (must be unique)
        }
    )
)

// ==================== 心跳标志 ==================
interface HeartbeatState {
    heartbeat: boolean
    setHeartbeat: (heartbeat: boolean) => void
}
export const useHeartbeatStore = create<HeartbeatState>()(
    (set) => ({
        heartbeat: false,
        setHeartbeat: (heartbeat: boolean) => set((state) => ({ heartbeat: heartbeat })),
    })
)


// 钱包连接状态
interface WalletState {
  isConnected: boolean
  address: string | null
  messageCount: number
  hasUnlimitedAccess: boolean
  setWalletState: (connected: boolean, address: string | null) => void
  incrementMessageCount: () => void
  setUnlimitedAccess: (unlimited: boolean) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      address: null, 
      messageCount: 0,
      hasUnlimitedAccess: false,
      setWalletState: (connected: boolean, address: string | null) => 
        set({ isConnected: connected, address: address }),
      incrementMessageCount: () => 
        set((state) => ({ messageCount: state.messageCount + 1 })),
      setUnlimitedAccess: (unlimited: boolean) =>
        set({ hasUnlimitedAccess: unlimited })
    }),
    {
      name: 'wallet-storage',
    }
  )
)
