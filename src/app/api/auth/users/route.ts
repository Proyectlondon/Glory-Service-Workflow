import { JWT_SECRET } from "@/lib/auth";

function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      area: string;
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = authenticate(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      users.map(({ password: _, ...user }) => user)
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = authenticate(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, area, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        area: area || "DISPATCHER",
        role: role || "user",
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
