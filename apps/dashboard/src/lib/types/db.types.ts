export interface PublicUserDataRow {
    user_id: string;
    // Add other fields that exist in your database
    username?: string;
    display_name?: string;
    avatar_url?: string;
    created_at?: string;
    // Add any other fields from your public_user_data table
}

export interface UsersRow {
    id: number;
    user_id: string;
    email: string;
}
