import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {

  group:any;
  members:any[]=[];

  private readonly apiUrl="https://localhost:7032/api/groups";

  constructor(
    private route:ActivatedRoute,
    private http:HttpClient,
    private router:Router
  ){}

  ngOnInit(): void {

    const id=Number(this.route.snapshot.paramMap.get('id'));

    this.loadGroup(id);
    this.loadMembers(id);

  }

  headers(){
    const token=localStorage.getItem('token') ?? '';

    return new HttpHeaders({
      Authorization:`Bearer ${token}`
    });
  }

  loadGroup(id:number){

    this.http.get<any>(`${this.apiUrl}/${id}`,
    {headers:this.headers()})
    .subscribe(res=>{
      this.group=res.data;
    });

  }

  loadMembers(id:number){

    this.http.get<any>(`${this.apiUrl}/${id}/members`,
    {headers:this.headers()})
    .subscribe(res=>{
      this.members=res.data;
    });

  }

  back(){
    this.router.navigate(['/dashboard/groups']);
  }

}