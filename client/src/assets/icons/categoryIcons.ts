import {
  Apple,
  Armchair,
  Bus,
  House,
  Zap,
  HeartPulse,
  GraduationCap,
  Shirt,
  Popcorn,
  Plane,
  Dumbbell,
  Sparkles,
  Gift,
  Wrench,
  Palette,
  PawPrint,
  ShieldCheck,
  Landmark,
  Fuel,
  ChartNoAxesCombined,
  HandHeart,
  Wifi,
  Baby,
  FileText,
  BadgeCheck,
  CreditCard,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { CategoryCode } from "../../types/category.type";

export const categoryIcons: Record<CategoryCode, LucideIcon> = {
  GRO: Apple, // Продукты питания
  HIM: Armchair, // Обустройство дома
  PT: Bus, // Общественный транспорт
  HR: House, // Аренда жилья
  UB: Zap, // Коммунальные услуги
  HLT: HeartPulse, // Здоровье
  EDU: GraduationCap, // Образование
  CLT: Shirt, // Одежда
  ENT: Popcorn, // Развлечения
  TRV: Plane, // Путешествия
  SPT: Dumbbell, // Спорт
  BTY: Sparkles, // Красота
  GFT: Gift, // Подарки
  REP: Wrench, // Ремонт
  HOB: Palette, // Хобби
  PTS: PawPrint, // Животные
  INS: ShieldCheck, // Страхование
  TX: Landmark, // Налоги
  FUE: Fuel, // Топливо
  INV: ChartNoAxesCombined, // Инвестиции
  CHY: HandHeart, // Благотворительность
  IC: Wifi, // Интернет и связь
  CG: Baby, // Детские товары
  VD: FileText, // Визы и документы
  SUB: BadgeCheck, // Подписки и сервисы
  CRE: CreditCard, // Кредит
};
