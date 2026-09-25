export type Product={id:string;name:string;price:number;category:string;image:string;available:boolean;featured?:boolean;description:string};
// This is display-only fallback content. Supabase rows replace it when configuration is present.
export const displayProducts:Product[]=[
 {id:'violet-garden',name:'Violet Garden Print',price:18,category:'Art Prints',image:'/images/artist-at-work.png',available:true,featured:true,description:'A small-run archival print, made to bring a gentle corner of the studio home.'},
 {id:'lilac-charm',name:'Lilac Charm',price:12,category:'Accessories',image:'/images/lil-reem-logo.jpeg',available:true,featured:true,description:'A hand-finished accessory with a quiet celestial detail.'},
 {id:'studio-note',name:'Studio Note Card Set',price:10,category:'Handmade',image:'/images/artist-at-work.png',available:true,featured:true,description:'A set of illustrated paper goods for little messages and big feelings.'}
];
export const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
