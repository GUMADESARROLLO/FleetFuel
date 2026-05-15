import { useId } from 'react';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import './DateRangePicker.css';

interface DateRangePickerProps {
  dateDesde: Date | null;
  dateHasta: Date | null;
  onDateDesdeChange: (date: Date | null) => void;
  onDateHastaChange: (date: Date | null) => void;
  desdeLabel?: string;
  hastaLabel?: string;
  inputClassName?: string;
}

export default function DateRangePicker({
  dateDesde,
  dateHasta,
  onDateDesdeChange,
  onDateHastaChange,
  desdeLabel = 'Desde',
  hastaLabel = 'Hasta',
  inputClassName = 'w-full h-9 px-2 bg-bg border border-border rounded-lg text-text text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer',
}: DateRangePickerProps) {
  const instanceId = useId();

  return (
    <div className="dp-root" data-dp-instance={instanceId}>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-text-muted mb-1 uppercase">
            {desdeLabel}
          </label>
          <DatePicker
            selected={dateDesde}
            onChange={onDateDesdeChange}
            selectsStart
            startDate={dateDesde || undefined}
            endDate={dateHasta || undefined}
            locale={es}
            dateFormat="dd/MM/yyyy"
            placeholderText="Fecha inicial"
            className={inputClassName}
            wrapperClassName="w-full"
            onKeyDown={e => e.preventDefault()}
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-text-muted mb-1 uppercase">
            {hastaLabel}
          </label>
          <DatePicker
            selected={dateHasta}
            onChange={onDateHastaChange}
            selectsEnd
            startDate={dateDesde || undefined}
            endDate={dateHasta || undefined}
            minDate={dateDesde || undefined}
            locale={es}
            dateFormat="dd/MM/yyyy"
            placeholderText="Fecha final"
            className={inputClassName}
            wrapperClassName="w-full"
            onKeyDown={e => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}
