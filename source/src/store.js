import { create } from 'zustand'
// Transient scroll state lives in a plain object read inside useFrame (no React renders).
export const scroll = { velocity: 0, sections: {}, pointer: { x: 0, y: 0 } }
export const useUI = create(set => ({
  ready: false, setReady: v => set({ ready: v }),
  giftOpen: false, setGiftOpen: v => set({ giftOpen: v }),
  lifeIndex: 0, setLifeIndex: i => set({ lifeIndex: i }),
  giftIndex: 0, setGiftIndex: i => set({ giftIndex: i }),
  lowPower: false, setLowPower: v => set({ lowPower: v })
}))
