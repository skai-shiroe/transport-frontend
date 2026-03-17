export interface Driver {
    id?: string;
    nom: string;
    prenom: string;
    telephone_1: string;
    telephone_2: string | null;
    numero_permis: string;
    date_expiration_permis: string;
    nationalite: string;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
    date_embauche: string;
    observations: string | null;
}

export interface DriverWithId extends Driver {
    id: string;
}

export interface Assignment {
    id?: string;
    vehicule_id: string;
    chauffeur_id: string;
    date_debut: string;
    date_fin: string | null;
    statut: 'EN_COURS' | 'TERMINE';
    observations: string | null;
}

export interface AssignmentWithRelations extends Assignment {
    id: string;
    vehicule: { immatriculation: string; marque: string };
    chauffeur: { nom: string; prenom: string };
}
