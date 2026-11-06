package com.example.memoapi.service;

import com.example.memoapi.dto.Note;
import com.example.memoapi.exception.NoteArgumentNotValidException;
import com.example.memoapi.repository.NoteRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class NoteServiceTests {
    private final RecordingNoteRepository repository = new RecordingNoteRepository();
    private final NoteService service = new NoteService(repository);

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n", "　"})
    void rejectsMissingOrBlankTitleWithoutSaving(String title) {
        Note note = new Note();
        note.setTitle(title);

        assertThrows(NoteArgumentNotValidException.class, () -> service.saveNote(note));
        assertNull(repository.savedNote);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"本文"})
    void savesValidTitleWithOptionalContent(String content) {
        Note note = new Note();
        note.setTitle("メモのタイトル");
        note.setContent(content);

        assertSame(note, service.saveNote(note));
        assertSame(note, repository.savedNote);
    }

    private static class RecordingNoteRepository extends NoteRepository {
        private Note savedNote;

        RecordingNoteRepository() {
            super(null);
        }

        @Override
        public int insertNote(Note note) {
            savedNote = note;
            return 1;
        }
    }
}
