import { supabase } from '../supabase';

export interface AgentState {
    last_interaction: string;
    pending_actions: any[];
    user_preferences_snapshot: any;
    conversation_summary: string;
    active_monitors: Array<{ type: string; target: any }>;
}

export const getAgentState = async (tripId: string): Promise<AgentState | null> => {
    try {
        const { data, error } = await supabase
            .from('itineraries')
            .select('agent_state')
            .eq('id', tripId)
            .single();

        if (error) throw error;
        return data?.agent_state || null;
    } catch (err) {
        console.warn('Failed to fetch agent state:', err);
        return null;
    }
};

export const updateAgentState = async (tripId: string, newState: Partial<AgentState>) => {
    try {
        // First get existing to merge
        const existing = await getAgentState(tripId);
        const updated = { ...existing, ...newState, last_interaction: new Date().toISOString() };

        const { error } = await supabase
            .from('itineraries')
            .update({ agent_state: updated })
            .eq('id', tripId);

        if (error) throw error;
        return updated;
    } catch (err) {
        console.error('Failed to update agent state:', err);
    }
};

export const logAgentAction = async (tripId: string, action: string, result: any) => {
    // A simplified log of actions taken by the agent for this trip
    // Could push to a specific 'agent_logs' table or just append to state
    console.log(`[Agent Log - ${tripId}] ${action}:`, result);
    // In a real implementation: await supabase.from('agent_logs').insert(...)
};
