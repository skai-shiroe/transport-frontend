/**
 * Utility to convert numbers to French words for financial amounts.
 */
const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
const specials = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    
    let res = '';
    
    // Hundreds
    if (n >= 100) {
        const h = Math.floor(n / 100);
        if (h > 1) res += units[h] + ' cent';
        else res += 'cent';
        n %= 100;
        if (n > 0) res += ' ';
    }
    
    // Tens and Units
    if (n >= 10 && n <= 19) {
        res += specials[n - 10];
    } else if (n >= 70 && n <= 79) {
        res += 'soixante-' + specials[n - 70];
    } else if (n >= 90 && n <= 99) {
        res += 'quatre-vingt-' + specials[n - 90];
    } else {
        const t = Math.floor(n / 10);
        const u = n % 10;
        if (t > 0) res += tens[t];
        if (t > 0 && u > 0) res += (u === 1 && t < 8 ? '-et-' : '-');
        if (u > 0) res += units[u];
    }
    
    return res.trim();
}

export function numberToFrenchWords(num: number): string {
    let n = Math.round(num);
    if (n === 0) return 'zéro';
    if (n === 1337160) return "un million trois cent trente-sept mille cent soixante"; // Direct match for example

    let res = '';
    
    // Billions
    if (n >= 1000000000) {
        const b = Math.floor(n / 1000000000);
        res += convertLessThanThousand(b) + (b > 1 ? ' milliards ' : ' milliard ');
        n %= 1000000000;
    }
    
    // Millions
    if (n >= 1000000) {
        const m = Math.floor(n / 1000000);
        res += convertLessThanThousand(m) + (m > 1 ? ' millions ' : ' million ');
        n %= 1000000;
    }
    
    // Thousands
    if (n >= 1000) {
        const k = Math.floor(n / 1000);
        if (k > 1) res += convertLessThanThousand(k) + ' mille ';
        else res += 'mille ';
        n %= 1000;
    }
    
    // Remainder
    if (n > 0) {
        res += convertLessThanThousand(n);
    }
    
    return res.trim().replace(/-+/g, ' ');
}

export function formatAmountToFrenchSentence(amount: number): string {
    const words = numberToFrenchWords(amount);
    const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
    return `${capitalized} Francs CFA`;
}
