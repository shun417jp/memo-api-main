package com.example.memoapi.cotroller;

import com.example.memoapi.dto.Note;
import com.example.memoapi.service.NoteService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<Note>> findAllNotes() {
        List<Note> notes = noteService.findAll();

        return new ResponseEntity<>(notes, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<Note> saveNote(@RequestBody Note note,
                                         UriComponentsBuilder uriBuilder){
        Note createNote = noteService.saveNote(note);

        URI location = uriBuilder.path("/api/notes/{id}")
                .buildAndExpand(createNote.getId()).toUri();

//        HttpHeaders headers = new HttpHeaders();
//        headers.setLocation(location);
//
//        return new ResponseEntity<>(createNote, headers,HttpStatus.CREATED);

        return ResponseEntity.created(location).body(createNote);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> findById(@PathVariable("id") long id){
        Note note = noteService.findById(id);
        if (note == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(note);
    }
}
