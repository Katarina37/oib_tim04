export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('sr-RS', {
        style: 'currency',
        currency: 'RSD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const parseDateInput = (dateString: string): Date | null => {
    if (!dateString) {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        return new Date(year, month - 1, day);
    }

    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
};

export const formatDate = (dateString: string): string => {
    const date = parseDateInput(dateString);
    if (!date) {
        return dateString;
    }
    return new Intl.DateTimeFormat('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};

export const formatDateTime = (dateString: string): string => {
    const date = parseDateInput(dateString);
    if (!date) {
        return dateString;
    }
    return new Intl.DateTimeFormat('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
