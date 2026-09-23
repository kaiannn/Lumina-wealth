import type { AssetType } from '@/types'

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  STOCK_CN: 'A股',
  STOCK_US: '美股',
  FUND: '基金',
  CRYPTO: '加密',
  BOND: '债券',
  CASH: '现金',
}

export const ASSET_UNIT: Record<AssetType, string> = {
  STOCK_CN: '股',
  STOCK_US: '股',
  FUND: '份',
  CRYPTO: '枚',
  BOND: '张',
  CASH: '',
}
