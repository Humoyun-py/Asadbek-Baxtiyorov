import { Target, Megaphone, Users, Bot, Search, Lightbulb, Rocket, LineChart } from 'lucide-react'
import type { Service } from '../types'

export const services: Service[] = [
  { title: 'TARGETING', text: 'Meta Ads orqali kerakli auditoriyaga reklama.', icon: Target },
  { title: 'SMM', text: 'Sahifa, kontent va brend yuritish.', icon: Megaphone },
  { title: 'LID GENERATSIYA', text: 'Reklamadan to\'g\'ridan-to\'g\'ri mijoz so\'rovlarini olish.', icon: Users },
  { title: 'AI YECHIMLAR', text: 'AI ulangan Telegram mini ilovalar.', icon: Bot },
]

export const processSteps = [
  { n: '01', title: 'TAHLIL', text: 'Biznes, mahsulot va auditoriyani o\'rganish.', icon: Search },
  { n: '02', title: 'STRATEGIYA', text: 'Reklama strategiyasi va kreativ yo\'nalishlarni ishlab chiqish.', icon: Lightbulb },
  { n: '03', title: 'ISHGA TUSHIRISH', text: 'Meta Ads kampaniyalarini ishga tushirish.', icon: Rocket },
  { n: '04', title: 'OPTIMIZATSIYA', text: 'Natijalarni kuzatish va reklamani yaxshilash.', icon: LineChart },
]

export const agencyServices = [
  'Meta Ads', 'Instagram targeting', 'Lid generatsiya', 'Savdo tizimlari',
  'Shaxsiy brend yuritish', 'Biznes sahifalarini rivojlantirish',
]
export const agencyMarkets = ['O\'zbekiston', 'Qozog\'iston', 'Vyetnam', 'Tojikiston']
export const AGENCY_TELEGRAM_URL = 'https://t.me/Targetolog_tehno'
export const TELEGRAM_HANDLE = '@baxt1yorov_asadbek'
export const TELEGRAM_URL = 'https://t.me/baxt1yorov_asadbek'
