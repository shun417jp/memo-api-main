package com.example.memoapi.cotroller;

import com.example.memoapi.dto.SampleMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {

    @GetMapping("/sample")
    public String sample() {
        return "Hello, Spring Boot API!";
    }

    @GetMapping("/sample/api")
    public ResponseEntity<SampleMessage> sampleApi() {
        SampleMessage sampleMessage = new SampleMessage();
        sampleMessage.setId(100);
        sampleMessage.setMessage("Hello, Spring API");

        return new ResponseEntity<>(sampleMessage, HttpStatus.OK);
    }
}
