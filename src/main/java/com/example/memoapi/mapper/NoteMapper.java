package com.example.memoapi.mapper;

import com.example.memoapi.dto.Note;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface NoteMapper {

    @Select("SELECT id, title, content, created_at FROM notes ORDER BY created_at DESC")
    List<Note> findAll();

    @Insert("INSERT INTO notes (title, content) VALUES (#{title}, #{content})")
    @Options(
            useGeneratedKeys = true,
            keyProperty = "id,createdAt",
            keyColumn = "id,created_at"
    )
    int insert(Note note);

    @Select("SELECT id, title, content, created_at FROM notes WHERE id = #{id}")
    Note findById(long id);

}
