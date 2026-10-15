import { Building2, Check, CreditCard, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pricingPlans } from "@/lib/pricing";

export function PricingModal({ label = "الباقات والأسعار" }: { label?: string }) {
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" className="min-h-12 whitespace-normal"><CreditCard className="h-4 w-4 shrink-0" />{label}</Button></DialogTrigger>
    <DialogContent dir="rtl" className="w-[calc(100%-2rem)] max-w-xl max-h-[90dvh] overflow-y-auto rounded-lg p-5 sm:p-6">
      <DialogHeader className="pt-4 sm:text-right">
        <DialogTitle className="text-xl">باقات منصة سهل</DialogTitle>
        <DialogDescription className="leading-7">اختر الباقة المناسبة لك — دفعة واحدة، بدون سحب تلقائي.</DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="individual" dir="rtl" className="min-w-0">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
          <TabsTrigger value="individual" className="min-h-12 gap-2 whitespace-normal"><UserRound className="h-4 w-4 shrink-0" />الأفراد</TabsTrigger>
          <TabsTrigger value="business" className="min-h-12 gap-2 whitespace-normal"><Building2 className="h-4 w-4 shrink-0" />المؤسسات ومكاتب الخدمات</TabsTrigger>
        </TabsList>
        {pricingPlans.map(plan => <TabsContent key={plan.id} value={plan.id} className="space-y-5 pt-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-sm leading-7 text-muted-foreground">اشتراك محدود المدة (صلاحية 30 يوماً - بدون تجديد تلقائي)</p>
            <p className="flex flex-wrap items-baseline gap-2"><strong className="text-4xl text-primary">{plan.priceSar}</strong><span className="font-medium">ريال</span><span className="text-sm text-muted-foreground">/ {plan.durationDays} يوماً</span></p>
          </div>
          <ul className="space-y-3 border-y border-border py-4">
            {plan.features.map(feature => <li key={feature} className="flex items-start gap-3 text-sm leading-7"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" /><span>{feature}</span></li>)}
          </ul>
          <p className="flex items-start gap-2 text-sm leading-7 text-muted-foreground"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-accent" />ورقة رسمية بيضاء بلا شعارات في جميع الباقات.</p>
          {plan.purchaseUrl ? <Button asChild variant="premium" className="min-h-12 w-full"><a href={plan.purchaseUrl} target="_blank" rel="noopener noreferrer"><ShoppingBag className="h-4 w-4" />شراء {plan.name} عبر سلة</a></Button> : <Button disabled variant="premium" className="min-h-12 w-full whitespace-normal"><ShoppingBag className="h-4 w-4 shrink-0" />شراء {plan.name} — قريباً عبر سلة</Button>}
        </TabsContent>)}
      </Tabs>
      <p className="text-xs leading-6 text-muted-foreground">الباقات المعروضة قيد التجهيز؛ الشراء غير متاح حتى إضافة روابط سلة وتفعيل مزايا الباقات، ومنها Word والنسخة الموجزة وإعادة التوجيه.</p>
    </DialogContent>
  </Dialog>;
}