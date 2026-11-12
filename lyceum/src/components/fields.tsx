import { LEVEL_OPTIONS } from "@/lib/text";

export function TextField({
  label,
  name,
  defaultValue = "",
  required = false,
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} maxLength={maxLength} placeholder={placeholder} />
    </label>
  );
}

export function AreaField({
  label,
  name,
  defaultValue = "",
  required = false,
  maxLength,
  rows = 6,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea name={name} defaultValue={defaultValue} required={required} maxLength={maxLength} rows={rows} />
    </label>
  );
}

export function LevelField({ value = "Foundation" }: { value?: string }) {
  return (
    <label className="field">
      <span>Level</span>
      <select name="level" defaultValue={value} required>
        {LEVEL_OPTIONS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SubjectField({ value = "" }: { value?: string }) {
  return (
    <label className="field">
      <span>Subject</span>
      <input name="subject" defaultValue={value} required maxLength={40} list="subjects" />
      <datalist id="subjects">
        <option value="Design" />
        <option value="Product" />
        <option value="Research" />
        <option value="Writing" />
      </datalist>
    </label>
  );
}
