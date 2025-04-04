package com.project.daisyDonation.Entity.Abstract;


import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public class Abstract {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)

private Long id;

public Long getId(){
    return id;
}
    public void setid (Long id){
        this.id = id;
    }
}
