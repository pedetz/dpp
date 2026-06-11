import { useState } from "react";
import { X } from "lucide-react";
import type { ProductData, TemplateField } from "@passaporto/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FileUpload } from "@/components/ui/FileUpload";
import { FieldRenderer } from "@/components/fields/FieldRenderer";
import { uploadPublicImage } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

export interface ProductFormValue {
  name: string;
  sku: string;
  gtin: string;
  category: string;
  data: ProductData;
  images: string[];
}

interface ProductFormProps {
  value: ProductFormValue;
  fields: TemplateField[];
  onChange: (value: ProductFormValue) => void;
  imagePrefix: string;
}

export function ProductForm({ value, fields, onChange, imagePrefix }: ProductFormProps) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  const setField = (key: string, fieldValue: unknown) => {
    onChange({ ...value, data: { ...value.data, [key]: fieldValue } });
  };

  const handleImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadPublicImage(imagePrefix, file);
      onChange({ ...value, images: [...value.images, url] });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    onChange({ ...value, images: value.images.filter((image) => image !== url) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("products.name")}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        <Select
          label={t("products.category")}
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
          options={[{ value: "tessile", label: t("products.categoryTextile") }]}
        />
        <Input
          label={t("products.sku")}
          value={value.sku}
          onChange={(e) => onChange({ ...value, sku: e.target.value })}
        />
        <Input
          label={t("products.gtin")}
          value={value.gtin}
          onChange={(e) => onChange({ ...value, gtin: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">{t("products.images")}</span>
        <div className="flex flex-wrap gap-3">
          {value.images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                aria-label={t("common.remove")}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <FileUpload
          accept="image/*"
          label={t("common.upload")}
          disabled={uploading}
          onSelect={(file) => void handleImage(file)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-gray-900">{t("products.data")}</h3>
        {fields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={value.data[field.key]}
            onChange={(fieldValue) => setField(field.key, fieldValue)}
          />
        ))}
      </div>
    </div>
  );
}
