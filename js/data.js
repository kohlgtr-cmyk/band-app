// =====================================================
// EDITE AQUI: coloque suas músicas e álbuns
// =====================================================

const BAND_NAME = "EchoDome Band"; // ← troque pelo nome da sua banda

const albums = [
  {
    id: "album1",
    name: "Echo",
    year: 2026,
    cover: "assets/img/full-band-logo.jpg", // ← coloque a capa (ou deixe null para emoji)
    coverEmoji: "🎸",               // ← emoji de fallback se não tiver capa
  },

];

const songs = [
  {
    id: 1,
    title: "Love Story",
    albumId: "album1",
    track: 1,
    file: "assets/music/love-story.mp3", // ← caminho do seu MP3
    duration: "4:05",
    lyrics: `VERSE 1

We were both young when I first saw you
I close my eyes and the flashback starts
You’re standing there
On a balcony in summer air

I see the lights, see the party, the ball gowns
You see me make my way through the crowd
And say: Hello
Little did you know

PRE-CHORUS

That I was Romeo and I were throwing pebbles
And your daddy said: Stay away from Juliet
And you were crying on the staircase
Begging me: Please, don't go

CHORUS

And you said: Romeo, take me somewhere we can be alone
I'll be waiting, all there's left to do is run
You'll be the prince and I'll be the princess
It's a love story, baby, just say yes

VERSE 2

So I sneak out to the garden to see you
We keep quiet 'cause we're dead if they knew
So close your eyes
Escape this town for a little while, uh, oh

PRE-CHORUS

'Cause I was Romeo, you were a scarlet letter
And your daddy said: Stay away from Juliet
But you were everything to me
You were begging me: Please, don't go

CHORUS

And I said: Juliet, I take you somewhere we can be alone
Just keep waiting, all there's left to do is run
I'll be the prince and you'll be the princess
It's a love story, baby, just say yes

VERSE 3

Romeo, save me, they're trying to tell me how to feel
This love is difficult, but it's real
Don't be afraid, we'll make it out of this mess
It's a love story, baby, just say yes
Oh, oh

BRIDGE

I got tired of waiting
Wondering if you were ever coming around
My faith in you was fading
When I met you on the outskirts of town

You said: Romeo, save me, I've been feeling so alone
I keep waiting for you, but you never come
Is this in my head? I don't know what to think
I knelt to the ground, pulled out a ring

OUTRO

And said: Marry me, Juliet, you'll never have to be alone
I love you and that's all I really know
I talked to your dad, go pick out a white dress
It's a love story, baby, just say yes

Oh, oh, oh
Oh, oh, oh, oh
'Cause we were both young when I first saw you`
  },
  {
    id: 2,
    title: "Between The Lines",
    albumId: "album1",
    track: 2,
    file: "assets/music/between-the-lines.mp3",
    duration: "4:30",
    lyrics: `VERSE 1

It’s 2 a.m. again.
I’m awake.
Not because I want to be.
Just… thinking.
About everything I have to hold together.
About how I don’t remember
the last time I felt light.
I don’t say that out loud.
I just carry it.

VERSE 2

I’ve learned how to function tired.
How to smile on low battery.
How to answer “I’m good”
without meaning it.
It’s not a lie.
It’s just easier.

PRE-CHORUS

Sometimes I wonder
if anyone would notice
how close I am
to empty.
Not broken.
Just… worn.

CHORUS

I’m still moving.
Still doing what I’m supposed to do.
But somewhere between responsibility
and expectation
I misplaced something that felt like me.
I’m not asking to escape.
I’m not asking for less.
I just wish
being strong
didn’t feel like disappearing.

VERSE 3

There’s a younger version of me
that still knocks sometimes.
He asks if we’re happy.
If we’re trying.
If we remember what we wanted.
I tell him
“Not now.”
And I hate that answer.

BRIDGE

I don’t want to quit.
I don’t want to run.
I just don’t want to wake up
one day
and realize
I survived everything
but never lived.

OUTRO

I’m still here.
Still holding it all together.
I just hope
there’s still something of me
between the lines.`,
  },
  {
    id: 3,
    title: "Eu Não Queria Sentir Assim",
    albumId: "album1",
    track: 3,
    file: "assets/music/eu-nao-queria-sentir-assim.mp3",
    duration: "4:15",
    lyrics: `VERSE 1

Eu não queria sentir assim
Era só mais um rosto na multidão
Mas quando você olhou pra mim
Alguma coisa saiu do controle da minha razão
Eu tentei fingir que era normal
Que era só coisa da minha cabeça
Mas toda vez que você passava
Meu mundo inteiro desaparecia

PRÉ-REFRÃO

Eu tento me esconder
Mas meus olhos me traem
Tudo que eu calei
Começa a gritar
REFRÃO – EXPLOSIVO

Seu olhar me atravessa
Me desmonta por dentro
Eu perco o ar
Eu perco o centro
Eu tentei resistir
Mas não dá pra negar
Quando você me olha assim
Eu deixo tudo desabar

VERSO 2

Eu me construí pra não sentir
Levantei muros pra me proteger
Mas você passa por cada um deles
Sem nem perceber
E eu odeio admitir
Que preciso de você aqui
Porque quando você não está
Parece que eu deixo de existir

PRÉ-REFRÃO

Eu finjo não ligar
Mas meu silêncio entrega
Cada batida do meu peito
Chamando por você

REFRÃO

Seu olhar me atravessa
Rasga tudo que eu sou
Me tira do escuro
Que eu mesmo criei ao redor
Eu tentei resistir
Mas não dá pra fugir
Quando você me olha assim
Eu começo a ruir

PONTE

Eu lutei contra isso
Eu neguei, eu fingi
Mas quanto mais eu me escondo
Mais eu corro pra ti
Se amar é perder o controle
Então eu já perdi
Se isso é fraqueza
Então eu escolhi

ÚLTIMO REFRÃO

Seu olhar me atravessa
E eu não quero escapar
Se for pra me quebrar por dentro
Que seja pra me transformar
Quando você me olha assim
Não existe mais chão
Só o som do meu peito
Explodindo em suas mãos`
  },
  {
    id: 4,
    title: "Echoes Of Yesterday",
    albumId: "album1",
    track: 4,
    file: "assets/music/echos.mp3",
    duration: "4:22",
    lyrics: `VERSE

    The photographs are fading on my wall,
    Names I can't recall in the shadows fall.
    Classrooms hum with voices I once knew,
    Laughter in the air that never rang true.

    
PRE-CHORUS

    Time rewinds like whispers down the hall,
    Footsteps echo but they never call.
    Was I ever really part of the scene?    
    Or just a ghost in someone else's dream?

    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.

    
VERSE

    Desk carvings fade with every passing spring,
    Promises we made don't mean a thing.
    Reunions pass like strangers in the night,
    No wrongs to right, no flames to light.

    
PRE-CHORUS

    Yearbooks gather dust upon the shelf,
    Memories I keep but can't reclaim myself.
    Did we ever really share the same sky?
    Or was I just learning how to say goodbye?

    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.
    
    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.

    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.`,
  },

  {
    id: 5,
    title: "I Feel Stuck",
    albumId: "album1",
    track: 5,
    file: "assets/music/i-feel-stuck.mp3",
    duration: "4:20",
    lyrics: `VERSE 1

I feel stuck
Face down on the floor
I want to change
But I don’t know what for
I try to follow my dream
But I never wrote it down
Time moves faster than me
And I’m still spinning around
Then I ask myself, “What now?”
But the silence is too loud

PRE-CHORUS

Every second that I waste
Feels like I’m fading away
I’m tired of living the same
On repeat every day

CHORUS

Happiness is not a goal
It’s the journey that you take
If I don’t start moving now
My whole life will be fake
I don’t want to be
Another victim of doubt
Just another lost soul
In the lost dreams town

VERSE 2

I built walls out of fear
Called it “playing safe”
Watched my years disappear
While I learned how to wait
I kept saying “someday”
Like it’s coming for free
But someday never shows
If it’s up to me

PRE-CHORUS

Every chance that I ignore
Turns into regret
I’m done with standing still
I’m not finished yet

CHORUS

Happiness is not a goal
It’s the fire in your veins
If I don’t chase it now
I’ve got no one else to blame
I don’t want to be
Another name worn down
Just another broken voice
In the lost dreams town

BRIDGE

What if I fail?
What if I fall?
What if I’m not enough at all?
But what if I fly?
What if I try?
What if this fear is just a lie?

FINAL CHORUS

Happiness is not a goal
It’s every step you make
And I’d rather fall chasing truth
Than live a life that’s fake
I won’t be
Another victim of doubt
I’m breaking out right now
From this lost dreams town`,
  },
  {
    id: 6,
    title: "Nunca Es Suficiente",
    albumId: "album1",
    track: 6,
    file: "assets/music/nunca-es-suficiente.mp3",
    duration: "3:25",
    lyrics: `Verso 1

    Me levanto antes del sol
Con mil preguntas y ningún control
Intento hacerlo todo perfecto
Pero siempre señalan el defecto
Cargo el día sobre mi piel
Tragando todo sin responder
Y cuando vuelvo buscando paz
Solo escucho lo que hice mal

Pre-Chorus

Corro, intento, vuelvo a empezar
Pero nada logra alcanzar
Lo que esperan de mí
Nunca es así

Chorus

Estoy cansado de intentarlo todo
Y escuchar que no es suficiente
¿Fue un mal día nada más
O cinco minutos en mi mente?
Si fallo una vez, lo repito otra vez
Como si fuera permanente
¿Un segundo borra lo demás?
¿Nada de lo bueno cuenta realmente?
Nunca es suficiente para ti

Verso 2

Mi silencio ahora es error
Mi cansancio falta de valor
Si respiro para no caer
Dicen que tengo que correr
Doy lo poco que queda en mí
Hasta sentir que me perdí
Pero siempre hay algo más
Siempre falta algo más

Pre-Chorus

Intento ser fuerte sin descansar
Pero nadie me quiere escuchar
Coro (más intenso)
Estoy cansado de intentarlo todo
Y escuchar que no es suficiente
¿Fue un mal día nada más
O cinco minutos en mi mente?
Si fallo una vez, lo repito otra vez
Como si fuera permanente
¿Un segundo borra lo demás?
¿Nada de lo bueno cuenta realmente?
Nunca es suficiente

Bridge

No soy máquina, soy humano
No soy hierro, tengo daño
Si me rompo es de verdad
No es debilidad

No soy solo mis errores
No soy solo presión
Si sigo aquí respirando
Es porque tengo corazón

Last Chorus

Estoy cansado — pero sigo de pie
Aunque me digan que no va a cambiar
Si fueron cinco minutos malos
¿Por qué me dejo condenar?
Nunca es suficiente para ti
Pero empieza a ser suficiente para mí`
  },
  {
    id: 7,
    title: "What If",
    albumId: "album1",
    track: 7,
    file: "assets/music/what-if.mp3",
    duration: "4:59",
    lyrics: `Verse 1

    Sometimes your name comes back
Like a city I never saw
Ten years living different lives
Still wondering what I lost
It’s not that I want to go back
Or tear apart what I built
But some nights ask me softly
Who I’d be without this guilt

Pre-Chorus

It’s not love calling me
It’s the road I never chose
A message left unsent
A door I never closed

Chorus

What if we had tried?
What if I had stayed?
Would we be strangers now
Or something we never named?
What if I took that plane
Drove four hundred miles for you?
It’s not that I want another life
I just wonder who I’d be… if I had followed through

Verse 2

There was someone amazing
But I didn’t know how to see
I was young and disillusioned
Too afraid to believe
Now I have a home, a child
Stability I can’t deny
But there are versions of me
Still living in those “goodbye”s

Pre-Chorus

It’s not desire — it’s memory
It’s curiosity

Bridge

Maybe it wasn’t destiny
Maybe it was fear
Maybe love was in my hands
But I just disappeared
Maybe we’d be broken
Maybe we’d be fine
Maybe happiness was never there
Just a story in my mind

Final Chorus 

What if I had tried?
What if I was brave?
Maybe I wouldn’t be happier
Just different than today
I don’t want to rewrite my life
Or undo what I’ve become
I just sometimes miss
The man I might have been…
Before I learned to run`
  },
  {
    id: 8,
    title: "The Boy I Was",
    albumId: "album1",
    track: 8,
    file: "assets/music/the-boy-i-was.mp3",
    duration: "4:49",
    lyrics: `Verse 1

    I found a picture of you today
Skinny arms and reckless faith
You thought the world was wide and kind
You didn’t know what it could take
You wore your heart outside your chest
Like armor made of glass
You thought that love would save you
You didn’t think it’d pass

Pre-Chorus

You swore you’d never lose yourself
You swore you’d never run
You had a fire inside your lungs
You thought you were the only one

Chorus

Hey, boy I was
You don’t know what’s coming
You don’t know how much you’ll bend
You’ll lose some fights
You’ll lose some friends
But you survive
More than you think you could
You’re not as weak
As you misunderstood
Hold on to that fire
Don’t let it go
I’m still trying to be you
More than you know

Verse 2

You thought distance meant the end
You thought heartbreak meant you failed
You didn’t see the bigger road
You couldn’t read the trails
You were chasing every “what if”
Like it held the cure
But growing up just means
Learning nothing’s ever pure

Pre-Chorus

You’ll build a life you never planned
You’ll love deeper than you knew
You’ll question every step you take
But you’ll still be you

Chorus

Hey, boy I was
You don’t know what’s coming
You don’t know how strong you’ll get
From all the things you’re running
You survive
Even when it hurts
You’ll find a home
Even through the worst
Hold on to that fire
Even when it’s hard
I’m still trying to carry
That fearless heart

Bridge

Hey…
I know you think you’re behind.
Like everyone else is moving faster.
Like you missed something.
You didn’t.
You think that if she leaves,
it means you weren’t enough.
It doesn’t.
You think every mistake defines you.
That every “almost” is a failure.
It’s not.
You’re going to love again.
You’re going to build something real.
You’re going to become someone
you don’t even recognize yet.
And yeah…
you’re going to doubt yourself.
A lot.
But listen to me —
You survive things
you don’t even know are coming.
And one day
you’ll look back at this version of you
and realize…
He was braver than he thought.
Don’t lose that fire.
I’m still trying to carry it.

Final Chorus

Hey, boy I was
You’d be proud of where we are
It’s not the dream you pictured
But it’s honest — and it’s ours
We didn’t get it perfect
We didn’t get it right
But we kept going
Every single night
Hold on to that fire
I finally know
You were stronger
Than you ever thought you’d be
And you saved me
More than you know`
  },
  {
    id: 9,
    title: "After Everyone Sleeps",
    albumId: "album1",
    track: 9,
    file: "assets/music/after-everyone-sleeps.mp3",
    duration: "4:29",
    lyrics: `Verse 1

    The house goes quiet after midnight
Footsteps fade down the hall
Toys on the floor like small reminders
Of a life I built through it all
The TV glow is slowly dying
Shadows stretch across the room
And for a moment there’s no noise
Just breathing in the gloom

Pre-Chorus

All day I carry everything
Like nothing’s breaking me
But when the silence finally comes
The truth starts speaking free

Chorus

After everyone sleeps
And the world finally slows
All the thoughts I buried
Are the ones that come and go
In the quiet of the dark
When there’s nowhere left to hide
I meet the man I really am
When there’s no one by my side

Verse 2

Your tiny shoes beside the doorway
A jacket hanging on the chair
Proof that somehow through the chaos
Love is living everywhere
And though the weight is always heavy
There’s a peace I can’t deny
In the fragile little moments
That the daylight passes by

Pre-Chorus

All day I’m trying to be the rock
The one who never breaks
But midnight knows the truth inside
Of every breath I take

Chorus

After everyone sleeps
And the world finally slows
All the fears I’m hiding
Are the ones nobody knows
In the quiet of the dark
Where the questions come alive
I meet the man I’m becoming
Somewhere deep inside

Bridge

Maybe strength is just surviving
Every doubt inside my head
Maybe love is just the promise
That I’ll rise from every dread

Final Chorus

After everyone sleeps
And the silence fills the air
I realize the life I feared
Is the one I’m building here
And though the night can feel so deep
And the road feels steep to climb
In the quiet I remember
This fragile life is mine`
  },
  {
    id: 10,
    title: "Somewhere Between Us",
    albumId: "album1",
    track: 10,
    file: "assets/music/somewhere-between-us.mp3",
    duration: "4:34",
    lyrics: `null`
  },
  {
    id: 11,
    title: "Letters I've Never Send",
    albumId: "album1",
    track: 11,
    file: "assets/music/letters-i-ve-never-send.mp3",
    duration: "4:34",
    lyrics: `null`
  }
];