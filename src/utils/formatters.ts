import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
        return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
        return dateString;
    }
};

export const truncateUUID = (uuid: string) => {
    if (!uuid || uuid.length <= 8) return uuid;
    return `${uuid.substring(0, 8)}...`;
};

export const isBoolean = (val: any) => typeof val === 'boolean';

export const isDateColumn = (columnName: string) => {
    const dateColumns = ['created_at', 'updated_at', 'processed_at', 'fecha_hora'];
    return dateColumns.includes(columnName);
};

export const isIDColumn = (columnName: string) => {
    const idColumns = ['id', 'aper_product_id', 'aper_order_id', 'id_aper'];
    return idColumns.includes(columnName);
};
