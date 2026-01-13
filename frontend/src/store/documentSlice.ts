import { createSlice } from '@reduxjs/toolkit'

interface DocumentState {
    documents: any[]
    currentDocument: any | null
    isLoading: boolean
}

const initialState: DocumentState = {
    documents: [],
    currentDocument: null,
    isLoading: false
}

const documentSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setDocuments: (state, action) => {
            state.documents = action.payload
        },
        setCurrentDocument: (state, action) => {
            state.currentDocument = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        }
    }
})

export const { setDocuments, setCurrentDocument, setLoading } = documentSlice.actions
export default documentSlice.reducer
