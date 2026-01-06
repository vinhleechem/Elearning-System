import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Chip,
    IconButton,
    Paper
} from "@mui/material";
import { Add, Delete, AccessTime } from "@mui/icons-material";

interface Note {
    id: number;
    timestamp: number;
    content: string;
    createdAt: Date;
}

interface CourseNotesProps {
    currentTime: number;
    onSeek: (time: number) => void;
}

const CourseNotes: React.FC<CourseNotesProps> = ({ currentTime, onSeek }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState("");

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAddNote = () => {
        if (!newNoteContent.trim()) return;

        const newNote: Note = {
            id: Date.now(),
            timestamp: currentTime,
            content: newNoteContent,
            createdAt: new Date(),
        };

        // Add and sort by timestamp
        setNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp - b.timestamp));
        setNewNoteContent("");
        setIsAdding(false);
    };

    const handleDelete = (id: number) => {
        if (confirm("Bạn có chắc muốn xóa ghi chú này?")) {
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <Box>
            {/* Add Note Section */}
            {!isAdding ? (
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    fullWidth
                    onClick={() => setIsAdding(true)}
                    sx={{ mb: 3, justifyContent: 'flex-start', textTransform: 'none', py: 1.5, borderStyle: 'dashed' }}
                >
                    Thêm ghi chú mới tại {formatTime(currentTime)}
                </Button>
            ) : (
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa", border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip icon={<AccessTime />} label={formatTime(currentTime)} size="small" color="primary" />
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Nhập nội dung ghi chú..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                        autoFocus
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => setIsAdding(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Hủy bỏ</Button>
                        <Button variant="contained" onClick={handleAddNote} sx={{ textTransform: 'none' }}>Lưu ghi chú</Button>
                    </Box>
                </Paper>
            )}

            {/* Notes List */}
            {notes.length === 0 && !isAdding ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Typography variant="body1">Bạn chưa có ghi chú nào trong bài học này.</Typography>
                    <Typography variant="body2">Hãy bấm vào nút ở trên để tạo ghi chú nhé!</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {notes.map((note) => (
                        <Paper key={note.id} elevation={0} sx={{ p: 2, border: '1px solid #eee', '&:hover': { bgcolor: '#fbfbfb' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Chip
                                    label={formatTime(note.timestamp)}
                                    size="small"
                                    clickable
                                    color="secondary"
                                    onClick={() => onSeek(note.timestamp)}
                                    sx={{ fontWeight: 'bold' }}
                                />
                                <Box>
                                    <IconButton size="small" onClick={() => handleDelete(note.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {note.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Tạo lúc: {note.createdAt.toLocaleTimeString()}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default CourseNotes;
