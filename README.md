#  Laboratorio de rutas — Algoritmos de búsqueda

## 1.  Objetivo

El objetivo del proyecto es entender y saber comparar 4 de los algoritmos que existen para poder aprender a tomar buenas decisiones en nuestros proyectos.

La aplicación nos muestra:

- cómo explora cada algoritmo el tablero;
- qué camino encuentra;
- cuántos nodos explora;
- cuántos pasos necesita;
- qué coste obtiene;
- cómo afectan los pesos de las celdas;
- cómo afectan los costes asociados a las metas;
- y cómo cambia el comportamiento cuando no existe solución.


---

## 2.  Tecnologías utilizadas

- **HTML5** — estructura de la interfaz.
- **CSS3** — diseño visual, tablero, colores, iconos y diseño responsive.
- **JavaScript ES6+** — lógica de la aplicación, interacción, animaciones y algoritmos.
- **DOM API** — creación y actualización dinámica del tablero y resultados.
- **CSS Grid** — construcción de la cuadrícula 20 × 20.
- **Sin dependencias externas** — el proyecto funciona directamente en un navegador moderno.

### Estructura

```text
proyecto/
├── index.html
├── style.css
├── app.js
├── algorithms.js
├── README.md
└── capturas/
    ├── interfaz-principal.svg
    ├── escenario-metas.svg
    └── comparacion.svg
```

---

## 3. Instrucciones de uso

### Opción A — Abrir directamente

1. Descarga o descomprime el proyecto.
2. Abre `index.html` con Chrome, Edge o Firefox.
3. No es necesario instalar ninguna librería.

### Opción B — Visual Studio Code

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Abre `index.html`.
3. Ejecuta el archivo con un servidor local, por ejemplo mediante Live Server.

### Flujo básico

1. Selecciona un algoritmo.
2. Configura el tablero manualmente o utiliza uno de los escenarios.
3. Pulsa **Ejecutar**.
4. Utiliza **Pausar / Continuar** para controlar la animación.
5. Activa o desactiva **Mostrar exploración** según quieras visualizar las celdas por las que pasa.
6. Pulsa **Comparar todas** para ejecutar los cuatro algoritmos.
7. Consulta los resultados individuales en la columna derecha y la tabla comparativa que está debajo del tablero.

---

## 4.  Elementos de la interfaz

### Barra superior

-  **Velocidad de animación**: modifica la velocidad a la que se ejecuta el algoritmo
-  **Mostrar exploración**: muestra u oculta los nodos explorados.
-  **Ejecutar**: ejecuta el algoritmo seleccionado.
-  **Comparar todas**: calcula y visualiza BFS, DFS, Coste Uniforme y A*.
-  **Pausar / Continuar**: detiene o continúa la animación.
-  **Aleatorio**: genera un tablero con inicio, metas, obstáculos y pesos aleatorios.
-  **Limpiar**: reinicia el tablero, incluso si la animación está pausada.

### Panel izquierdo

Permite seleccionar:

- Algoritmo.
- Escenario.
- Herramienta de dibujo.
- Peso de celda.
- Coste de meta.
- Número de metas aleatorias.
- Meta activa cuando existen varias metas.

### Herramientas de dibujo

-  **Obstáculo**: impide el paso del algoritmo.
-  **Borrar**: elimina obstáculos, pesos o metas.
-  **Inicio**: coloca o mueve el punto de partida.
-  **Meta**: añade una meta.
-  **Peso**: asigna un coste de entrada a una celda.

---

## 5.  Descripción de los algoritmos

###  BFS — Breadth-First Search

**Búsqueda en anchura.**

BFS utiliza una cola. Primero entra el inicio y después sus vecinos. Los vecinos de esos vecinos se añaden detrás. Por eso explora por niveles.

---

###  DFS — Depth-First Search

**Búsqueda en profundidad.**

DFS utiliza una pila. El algoritmo continúa por una rama hasta que no puede seguir y entonces retrocede.

---

###  Coste Uniforme — Uniform Cost Search

UCS selecciona la celda cuyo coste acumulado desde el inicio es menor. 

---

###  A* 

A* combina el coste ya recorrido con una estimación del coste que falta.

---

## 6.  Los cuatro escenarios

### 1. Menos pasos

Tablero limpio con inicio y una meta.

Sirve para observar el comportamiento básico de los algoritmos en un entorno sin obstáculos ni pesos.

### 2. Pesos

Incluye una zona de celdas con costes elevados.

Permite observar la diferencia entre algoritmos que buscan principalmente por pasos y algoritmos que consideran el coste.

### 3. Metas con costes

Incluye varias metas con costes diferentes.

Una meta físicamente más cercana puede tener un coste mayor que otra más alejada.

La aplicación permite seleccionar la **meta activa** y comparar los algoritmos respecto a ella.

### 4. Sin solución

Se crea una barrera que separa el inicio y la meta.

Sirve para comprobar cómo los cuatro algoritmos detectan que no existe un camino válido.

---

## 7.  Resultados y comparación

La aplicación muestra resultados individuales en una **columna situada a la derecha del tablero**.

Al pulsar **Comparar todas**, aparece debajo del tablero una tabla mostrando los datos que saca cada algoritmo.

### Actualización dinámica

La tabla se recalcula cuando cambia el estado del tablero, por ejemplo:

- obstáculos;
- pesos;
- inicio;
- metas;
- coste de las metas;
- meta activa;
- escenarios;
- tablero aleatorio;
- limpieza del tablero.

---

## 8.  Pruebas realizadas

### Prueba 1 — Tablero sin obstáculos

**Objetivo:** comprobar que los cuatro algoritmos pueden encontrar una meta en un tablero libre.

**Resultado esperado:** los algoritmos deben encontrar un camino y mostrar sus métricas.

### Prueba 2 — Obstáculos

**Objetivo:** comprobar que ningún algoritmo atraviesa las celdas marcadas como obstáculos.

**Resultado esperado:** los caminos encontrados rodean los obstáculos.

### Prueba 3 — Pesos

**Objetivo:** comprobar que Coste Uniforme y A* tienen en cuenta el coste de las celdas.

**Resultado esperado:** pueden elegir un camino con más pasos si su coste total es menor.

### Prueba 4 — Varias metas

**Objetivo:** comprobar la selección de la meta activa y el coste asociado a cada meta.

**Resultado esperado:** la comparación cambia cuando se selecciona otra meta.

### Prueba 5 — Sin solución

**Objetivo:** comprobar el comportamiento cuando la meta está aislada.

**Resultado esperado:** `Encontrado = No`, pasos y coste aparecen como `—`.

### Prueba 6 — Pausa y limpieza

**Objetivo:** comprobar que la animación puede pausarse y que **Limpiar** sigue funcionando durante la pausa.

**Resultado esperado:** el tablero vuelve a quedar preparado para una nueva ejecución.

### Prueba 7 — Tabla comparativa

**Objetivo:** comprobar que la tabla comparativa representa siempre el tablero actual.

**Resultado esperado:** al modificar obstáculos, pesos, metas, inicio o costes, los resultados se recalculan.

---

## 12.  Archivos principales

### `index.html`

Contiene la estructura de la interfaz: barra superior, panel de configuración, tablero, resultados y tabla comparativa.

### `style.css`

Contiene el diseño visual, colores, iconos, cuadrícula, tabla y comportamiento responsive.

### `app.js`

Gestiona la interacción con el usuario, creación del tablero, escenarios, herramientas de dibujo, animaciones, pausa, comparación y actualización dinámica de resultados.

### `algorithms.js`

En este archivo guardamos los algoritmos a los que después llamaremos desde 'app.js' 

---

## ‍ Autora

**Maitane Herrera**

