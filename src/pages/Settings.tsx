import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";

const Settings = () => {
  const settings = useLiveQuery(() => db.appSettings.get(1));

  const [companyName, setCompanyName] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");
  const [taxNumber, setTaxNumber] = React.useState("");

  React.useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || "");
      setCompanyAddress(settings.companyAddress || "");
      setTaxNumber(settings.taxNumber || "");
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await db.appSettings.put({
        id: 1,
        companyName,
        companyAddress,
        taxNumber,
      });
      showSuccess("تم حفظ الإعدادات بنجاح.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("حدث خطأ أثناء حفظ الإعدادات.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-right">الإعدادات</h1>
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
          <CardDescription>
            أدخل معلومات شركتك. سيتم استخدام هذه المعلومات في الفواتير والتقارير.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid gap-3">
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="اسم شركتك"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="companyAddress">عنوان الشركة</Label>
              <Textarea
                id="companyAddress"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="العنوان الكامل لشركتك"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="taxNumber">الرقم الضريبي</Label>
              <Input
                id="taxNumber"
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="الرقم الضريبي للشركة"
              />
            </div>
             <div className="flex justify-end">
                <Button type="submit">حفظ التغييرات</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;